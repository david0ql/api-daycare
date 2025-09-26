import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRolesEntity } from 'src/entities/user_roles.entity';

/**
 * Service for managing user roles
 * Provides business logic for role-related operations
 */
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserRolesEntity)
    private readonly userRolesRepository: Repository<UserRolesEntity>,
  ) {}

  /**
   * Get all available user roles
   * @returns Promise<UserRolesEntity[]> - Array of all user roles
   */
  async getRoles(): Promise<UserRolesEntity[]> {
    return this.userRolesRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }
}
