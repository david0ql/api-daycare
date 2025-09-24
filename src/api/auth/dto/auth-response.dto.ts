import { ApiProperty } from '@nestjs/swagger';
import { UserRolesEntity } from 'src/entities/user_roles.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'parent@example.com' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      phone: { type: 'string', example: '+1234567890' },
      role: { type: 'object', additionalProperties: true },
    },
  })
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRolesEntity;
  };
}
