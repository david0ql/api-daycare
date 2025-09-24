import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersEntity } from 'src/entities/users.entity';
import { UserRolesEntity } from 'src/entities/user_roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, UserRolesEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}