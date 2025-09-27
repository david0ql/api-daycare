import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateEmergencyContactDto {
  @ApiProperty({
    description: 'Child ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  childId?: number;

  @ApiProperty({
    description: 'Contact name',
    example: 'María García',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Relationship to child',
    example: 'Abuela',
  })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+57 300 123 4567',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Email address',
    example: 'maria.garcia@email.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Is primary emergency contact',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = false;
}
