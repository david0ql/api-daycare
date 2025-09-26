import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { RoleResponseDto } from './dto/role-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controller for managing user roles
 * Provides endpoints to retrieve available user roles in the system
 */
@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('administrator')
  @ApiOperation({
    summary: 'Get all user roles',
    description: 'Retrieve all available user roles in the system. Only administrators can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all available user roles',
    type: [RoleResponseDto],
    schema: {
      example: [
        {
          id: 1,
          name: 'administrator',
          description: 'System administrator with full access to all features',
          createdAt: '2025-09-24T05:18:01.000Z',
        },
        {
          id: 2,
          name: 'educator',
          description: 'Educator with access to children and attendance management',
          createdAt: '2025-09-24T05:18:01.000Z',
        },
        {
          id: 3,
          name: 'parent',
          description: 'Parent with access to their children information',
          createdAt: '2025-09-24T05:18:01.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions (only administrators can access)',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getRoles(): Promise<RoleResponseDto[]> {
    return this.rolesService.getRoles();
  }
}
