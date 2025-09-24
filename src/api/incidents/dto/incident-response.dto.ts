import { ApiProperty } from '@nestjs/swagger';

export class IncidentAttachmentResponseDto {
  @ApiProperty({ description: 'Attachment ID' })
  id: number;

  @ApiProperty({ description: 'Attachment filename' })
  filename: string;

  @ApiProperty({ description: 'Attachment file path' })
  filePath: string;

  @ApiProperty({ 
    description: 'File type',
    enum: ['image', 'document']
  })
  fileType: 'image' | 'document';

  @ApiProperty({ description: 'Upload timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'User who uploaded the attachment' })
  uploadedBy2: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class IncidentResponseDto {
  @ApiProperty({ description: 'Incident ID' })
  id: number;

  @ApiProperty({ description: 'Child ID involved in the incident' })
  childId: number;

  @ApiProperty({ description: 'Incident type ID' })
  incidentTypeId: number;

  @ApiProperty({ description: 'Incident title' })
  title: string;

  @ApiProperty({ description: 'Incident description' })
  description: string;

  @ApiProperty({ description: 'Date and time when the incident occurred' })
  incidentDate: Date;

  @ApiProperty({ description: 'Location where the incident occurred', nullable: true })
  location: string | null;

  @ApiProperty({ description: 'Action taken in response to the incident', nullable: true })
  actionTaken: string | null;

  @ApiProperty({ description: 'Whether parent was notified' })
  parentNotified: boolean;

  @ApiProperty({ description: 'When parent was notified', nullable: true })
  parentNotifiedAt: Date | null;

  @ApiProperty({ description: 'User who reported the incident' })
  reportedBy: number;

  @ApiProperty({ description: 'Incident creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Incident last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Child information' })
  child: {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: Date;
  };

  @ApiProperty({ description: 'Incident type information' })
  incidentType: {
    id: number;
    name: string;
    description: string | null;
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
  };

  @ApiProperty({ description: 'User who reported the incident' })
  reportedBy2: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ 
    description: 'Incident attachments',
    type: [IncidentAttachmentResponseDto]
  })
  incidentAttachments: IncidentAttachmentResponseDto[];
}
