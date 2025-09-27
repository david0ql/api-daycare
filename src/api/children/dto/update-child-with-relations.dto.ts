import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';
import { CreateParentChildRelationshipDto } from './create-parent-child-relationship.dto';
import { CreateEmergencyContactDto } from './create-emergency-contact.dto';
import { CreateAuthorizedPickupPersonDto } from './create-authorized-pickup-person.dto';
import { CreateMedicalInformationDto } from './create-medical-information.dto';

export class UpdateChildWithRelationsDto {
  @ApiProperty({
    description: 'Child first name',
    example: 'María',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Child last name',
    example: 'García López',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Child birth date',
    example: '2020-03-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({
    description: 'Child birth city',
    example: 'Bogotá',
    required: false,
  })
  @IsString()
  @IsOptional()
  birthCity?: string;

  @ApiProperty({
    description: 'Child address',
    example: 'Calle 123 #45-67',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Child profile picture URL',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    description: 'Has payment alert',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  hasPaymentAlert?: boolean;

  @ApiProperty({
    description: 'Is child active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Parent-child relationships',
    type: [CreateParentChildRelationshipDto],
    required: false,
  })
  @IsOptional()
  parentRelationships?: CreateParentChildRelationshipDto[];

  @ApiProperty({
    description: 'Emergency contacts',
    type: [CreateEmergencyContactDto],
    required: false,
  })
  @IsOptional()
  emergencyContacts?: CreateEmergencyContactDto[];

  @ApiProperty({
    description: 'Authorized pickup persons',
    type: [CreateAuthorizedPickupPersonDto],
    required: false,
  })
  @IsOptional()
  authorizedPickupPersons?: CreateAuthorizedPickupPersonDto[];

  @ApiProperty({
    description: 'Medical information',
    type: [CreateMedicalInformationDto],
    required: false,
  })
  @IsOptional()
  medicalInformation?: CreateMedicalInformationDto[];
}
