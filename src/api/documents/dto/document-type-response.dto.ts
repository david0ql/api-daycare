import { ApiProperty } from '@nestjs/swagger';

export class DocumentTypeResponseDto {
  @ApiProperty({ description: 'Document type ID' })
  id: number;

  @ApiProperty({ description: 'Document type name' })
  name: string;

  @ApiProperty({ description: 'Document type description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Retention period in days', nullable: true })
  retentionDays: number | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Number of documents of this type' })
  documentCount: number;
}
