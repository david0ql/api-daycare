import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersEntity } from 'src/entities/users.entity';
import { UserRolesEntity } from 'src/entities/user_roles.entity';
import { FileUploadService } from '../attendance/services/file-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, UserRolesEntity]),
    MulterModule.register({}),
  ],
  controllers: [UsersController],
  providers: [UsersService, FileUploadService],
  exports: [UsersService],
})
export class UsersModule {}