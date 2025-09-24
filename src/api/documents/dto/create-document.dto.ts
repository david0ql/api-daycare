import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Child ID to associate the document with' })
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Document type ID' })
  @IsNumber()
  @IsNotEmpty()
  documentTypeId: number;

  @ApiProperty({ description: 'Generated filename for storage' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'Original filename from upload' })
  @IsString()
  @IsNotEmpty()
  originalFilename: string;

  @ApiProperty({ description: 'File path where document is stored' })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ 
    description: 'Document expiration date (optional)',
    example: '2025-01-15T00:00:00Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}