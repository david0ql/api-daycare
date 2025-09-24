import { ApiProperty } from '@nestjs/swagger';

export class ChildResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiProperty({ example: '2020-01-15' })
  birthDate: string;

  @ApiProperty({ example: 'Bogotá', required: false })
  birthCity?: string;

  @ApiProperty({ example: 'https://example.com/child.jpg', required: false })
  profilePicture?: string;

  @ApiProperty({ example: 'Calle 123 #45-67, Bogotá', required: false })
  address?: string;

  @ApiProperty({ example: false })
  hasPaymentAlert: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
