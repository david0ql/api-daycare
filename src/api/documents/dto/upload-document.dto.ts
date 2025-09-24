import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Child ID to associate the document with' })
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Document type ID' })
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
