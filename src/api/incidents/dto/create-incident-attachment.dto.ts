import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';

export enum FileTypeEnum {
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export class CreateIncidentAttachmentDto {
  @ApiProperty({ description: 'Incident ID to attach file to' })
  @IsNumber()
  @IsNotEmpty()
  incidentId: number;

  @ApiProperty({ description: 'Attachment filename' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'Attachment file path' })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({ 
    description: 'File type',
    enum: FileTypeEnum,
    example: FileTypeEnum.IMAGE
  })
  @IsEnum(FileTypeEnum)
  fileType: FileTypeEnum;
}
