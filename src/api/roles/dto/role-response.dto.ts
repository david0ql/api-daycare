import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user role response
 * Represents a user role with its basic information
 */
export class RoleResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the role',
    example: 1,
    type: 'integer',
  })
  id: number;

  @ApiProperty({
    description: 'Name of the role',
    example: 'administrator',
    type: 'string',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the role and its permissions',
    example: 'System administrator with full access to all features',
    type: 'string',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Date and time when the role was created',
    example: '2025-09-24T05:18:01.000Z',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  createdAt: Date | null;
}
