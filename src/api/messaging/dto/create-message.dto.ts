import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'Thread ID where the message belongs' })
  @IsNumber()
  @IsNotEmpty()
  threadId: number;

  @ApiProperty({ description: 'Message text content' })
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
