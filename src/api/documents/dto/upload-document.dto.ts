import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Child ID to associate the document with' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Document type ID' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsNotEmpty()
  documentTypeId: number;

  @ApiProperty({ 
    description: 'Document expiration date (optional)',
    example: '2025-01-15T00:00:00Z',
    required: false
  })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
