import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateAuthorizedPickupPersonDto {
  @ApiProperty({
    description: 'Child ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  childId?: number;

  @ApiProperty({
    description: 'Person name',
    example: 'Carlos López',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Relationship to child',
    example: 'Tío',
  })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+57 300 987 6543',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Email address',
    example: 'carlos.lopez@email.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Photo URL',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiProperty({
    description: 'ID document number',
    example: '12345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  idDocument?: string;
}
