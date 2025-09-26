import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UserRolesEntity } from 'src/entities/user_roles.entity';

/**
 * Module for managing user roles
 * Provides controllers and services for role-related operations
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserRolesEntity])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
