import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { ParentChildRelationshipsEntity } from 'src/entities/parent_child_relationships.entity';
import { UsersEntity } from 'src/entities/users.entity';
import envVars from 'src/config/env';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private initialized = false;

  constructor(
    @InjectRepository(ParentChildRelationshipsEntity)
    private readonly parentChildRepository: Repository<ParentChildRelationshipsEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  onModuleInit() {
    if (!envVars.FIREBASE_PROJECT_ID || !envVars.FIREBASE_CLIENT_EMAIL || !envVars.FIREBASE_PRIVATE_KEY) {
      this.logger.warn('Firebase credentials not configured. Push notifications disabled.');
      return;
    }

    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: envVars.FIREBASE_PROJECT_ID,
            clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
            privateKey: envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      }
      this.initialized = true;
      this.logger.log('Firebase Admin SDK initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * Sends a push notification to all parents of a given child that have a registered FCM token.
   * Fire-and-forget: errors are logged but not thrown.
   */
  async notifyChildParents(
    childId: number,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!this.initialized) return;

    try {
      const relationships = await this.parentChildRepository.find({
        where: { childId },
        relations: ['parent'],
      });

      const tokens = relationships
        .map((r) => r.parent?.fcmToken)
        .filter((t): t is string => !!t && t.length > 0);

      if (tokens.length === 0) return;

      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: { title, body },
        data: data ?? {},
        android: {
          priority: 'high',
          notification: { sound: 'default' },
        },
        apns: {
          payload: { aps: { sound: 'default' } },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `FCM sent for child ${childId}: ${response.successCount} ok, ${response.failureCount} failed`,
      );

      // Remove stale tokens
      const staleTokens: string[] = [];
      response.responses.forEach((res, idx) => {
        if (
          !res.success &&
          res.error?.code === 'messaging/registration-token-not-registered'
        ) {
          staleTokens.push(tokens[idx]);
        }
      });

      if (staleTokens.length > 0) {
        await this.usersRepository
          .createQueryBuilder()
          .update()
          .set({ fcmToken: null as any })
          .where('fcm_token IN (:...tokens)', { tokens: staleTokens })
          .execute();
      }
    } catch (error) {
      this.logger.error(`Error sending FCM notification for child ${childId}:`, error);
    }
  }
}
