import { ApiProperty } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({ description: 'Document ID' })
  id: number;

  @ApiProperty({ description: 'Child ID associated with the document' })
  childId: number;

  @ApiProperty({ description: 'Document type ID' })
  documentTypeId: number;

  @ApiProperty({ description: 'Generated filename for storage' })
  filename: string;

  @ApiProperty({ description: 'Original filename from upload' })
  originalFilename: string;

  @ApiProperty({ description: 'File path where document is stored' })
  filePath: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'MIME type of the file' })
  mimeType: string;

  @ApiProperty({ description: 'User ID who uploaded the document' })
  uploadedBy: number;

  @ApiProperty({ description: 'Document creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Document expiration date', nullable: true })
  expiresAt: Date | null;

  @ApiProperty({ description: 'Child information' })
  child: {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: Date;
  };

  @ApiProperty({ description: 'Document type information' })
  documentType: {
    id: number;
    name: string;
    description: string | null;
    retentionDays: number | null;
  };

  @ApiProperty({ description: 'User who uploaded the document' })
  uploadedBy2: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ description: 'Whether the document has expired' })
  isExpired: boolean;

  @ApiProperty({ description: 'Days until expiration (negative if expired)' })
  daysUntilExpiration: number;
}
