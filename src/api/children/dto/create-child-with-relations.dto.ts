import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateParentChildRelationshipDto } from './create-parent-child-relationship.dto';
import { CreateEmergencyContactDto } from './create-emergency-contact.dto';
import { CreateAuthorizedPickupPersonDto } from './create-authorized-pickup-person.dto';
import { CreateMedicalInformationDto } from './create-medical-information.dto';

export class CreateChildWithRelationsDto {
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

  @ApiProperty({
    description: 'Parent-child relationships',
    type: [CreateParentChildRelationshipDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParentChildRelationshipDto)
  @IsOptional()
  parentRelationships?: CreateParentChildRelationshipDto[];

  @ApiProperty({
    description: 'Emergency contacts',
    type: [CreateEmergencyContactDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmergencyContactDto)
  @IsOptional()
  emergencyContacts?: CreateEmergencyContactDto[];

  @ApiProperty({
    description: 'Authorized pickup persons',
    type: [CreateAuthorizedPickupPersonDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAuthorizedPickupPersonDto)
  @IsOptional()
  authorizedPickupPersons?: CreateAuthorizedPickupPersonDto[];

  @ApiProperty({
    description: 'Medical information',
    type: CreateMedicalInformationDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => CreateMedicalInformationDto)
  @IsOptional()
  medicalInformation?: CreateMedicalInformationDto;
}
