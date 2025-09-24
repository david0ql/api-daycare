import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateChildDto {
  @ApiProperty({
    description: 'Child first name',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Child last name',
    example: 'Pérez',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Child birth date',
    example: '2020-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    description: 'Child birth city',
    example: 'Bogotá',
    required: false,
  })
  @IsString()
  @IsOptional()
  birthCity?: string;

  @ApiProperty({
    description: 'Child profile picture URL',
    example: 'https://example.com/child.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    description: 'Child address',
    example: 'Calle 123 #45-67, Bogotá',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Payment alert status',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasPaymentAlert?: boolean = false;

  @ApiProperty({
    description: 'Active status',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}