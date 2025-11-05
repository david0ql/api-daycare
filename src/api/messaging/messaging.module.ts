import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { MessageThreadsEntity } from 'src/entities/message_threads.entity';
import { MessagesEntity } from 'src/entities/messages.entity';
import { MessageRecipientsEntity } from 'src/entities/message_recipients.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageThreadsEntity,
      MessagesEntity,
      MessageRecipientsEntity,
      ChildrenEntity,
      UsersEntity,
    ]),
    SharedModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}