import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmService } from './fcm.service';
import { NotificationLogService } from './notification-log.service';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogEntity } from 'src/entities/notification_logs.entity';
import { ParentChildRelationshipsEntity } from 'src/entities/parent_child_relationships.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationLogEntity,
      ParentChildRelationshipsEntity,
      UsersEntity,
    ]),
  ],
  controllers: [NotificationLogController],
  providers: [FcmService, NotificationLogService],
  exports: [FcmService, NotificationLogService],
})
export class NotificationsModule {}
