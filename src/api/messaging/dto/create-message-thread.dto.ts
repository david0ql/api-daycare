import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsArray, IsNumber, IsOptional } from 'class-validator';

export enum ThreadTypeEnum {
  GENERAL = 'general',
  INCIDENT = 'incident',
  REMINDER = 'reminder',
  ACTIVITY = 'activity',
}

export class CreateMessageThreadDto {
  @ApiProperty({ description: 'Child ID associated with the thread' })
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Thread subject' })
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ 
    description: 'Thread type',
    enum: ThreadTypeEnum,
    example: ThreadTypeEnum.GENERAL
  })
  @IsEnum(ThreadTypeEnum)
  threadType: ThreadTypeEnum;

  @ApiProperty({ description: 'Initial message text' })
  @IsNotEmpty()
  messageText: string;

  @ApiProperty({ 
    description: 'Array of recipient user IDs',
    type: [Number],
    example: [1, 2, 3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  recipientIds: number[];

  @ApiProperty({ 
    description: 'Attachment filename',
    required: false
  })
  @IsOptional()
  attachmentFilename?: string;

  @ApiProperty({ 
    description: 'Attachment file path',
    required: false
  })
  @IsOptional()
  attachmentPath?: string;
}
