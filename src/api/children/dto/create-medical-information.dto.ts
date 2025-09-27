import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateMedicalInformationDto {
  @ApiProperty({
    description: 'Child ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  childId?: number;

  @ApiProperty({
    description: 'Allergies information',
    example: 'Ninguna alergia conocida',
    required: false,
  })
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiProperty({
    description: 'Current medications',
    example: 'Ninguna medicación actual',
    required: false,
  })
  @IsString()
  @IsOptional()
  medications?: string;

  @ApiProperty({
    description: 'Insurance company',
    example: 'Sura',
    required: false,
  })
  @IsString()
  @IsOptional()
  insuranceCompany?: string;

  @ApiProperty({
    description: 'Insurance number',
    example: '123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  insuranceNumber?: string;

  @ApiProperty({
    description: 'Pediatrician name',
    example: 'Dr. Ana Martínez',
    required: false,
  })
  @IsString()
  @IsOptional()
  pediatricianName?: string;

  @ApiProperty({
    description: 'Pediatrician phone',
    example: '+57 300 555 1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  pediatricianPhone?: string;

  @ApiProperty({
    description: 'Additional medical notes',
    example: 'Niño sano, sin condiciones especiales',
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalNotes?: string;
}
