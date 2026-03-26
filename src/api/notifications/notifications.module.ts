import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmService } from './fcm.service';
import { ParentChildRelationshipsEntity } from 'src/entities/parent_child_relationships.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ParentChildRelationshipsEntity, UsersEntity]),
  ],
  providers: [FcmService],
  exports: [FcmService],
})
export class NotificationsModule {}
