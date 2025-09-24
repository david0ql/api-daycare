import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateIncidentDto {
  @ApiProperty({ description: 'Child ID involved in the incident' })
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Incident type ID' })
  @IsNumber()
  @IsNotEmpty()
  incidentTypeId: number;

  @ApiProperty({ description: 'Incident title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed incident description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    description: 'Date and time when the incident occurred',
    example: '2024-01-15T10:30:00Z'
  })
  @IsDateString()
  @IsNotEmpty()
  incidentDate: string;

  @ApiProperty({ 
    description: 'Location where the incident occurred',
    required: false
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ 
    description: 'Action taken in response to the incident',
    required: false
  })
  @IsString()
  @IsOptional()
  actionTaken?: string;
}