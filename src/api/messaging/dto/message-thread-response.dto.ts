import { ApiProperty } from '@nestjs/swagger';
import { ThreadTypeEnum } from './create-message-thread.dto';

export class MessageResponseDto {
  @ApiProperty({ description: 'Message ID' })
  id: number;

  @ApiProperty({ description: 'Message text content' })
  messageText: string;

  @ApiProperty({ description: 'Attachment filename', nullable: true })
  attachmentFilename: string | null;

  @ApiProperty({ description: 'Attachment file path', nullable: true })
  attachmentPath: string | null;

  @ApiProperty({ description: 'Whether message is read' })
  isRead: boolean;

  @ApiProperty({ description: 'Message creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Sender information' })
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ description: 'Message recipients', type: 'array' })
  messageRecipients: Array<{
    id: number;
    isRead: boolean;
    readAt: Date | null;
    recipient: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export class MessageThreadResponseDto {
  @ApiProperty({ description: 'Thread ID' })
  id: number;

  @ApiProperty({ description: 'Child ID associated with the thread' })
  childId: number;

  @ApiProperty({ description: 'Thread subject' })
  subject: string;

  @ApiProperty({ 
    description: 'Thread type',
    enum: ThreadTypeEnum
  })
  threadType: ThreadTypeEnum;

  @ApiProperty({ description: 'Thread creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Thread last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Child information' })
  child: {
    id: number;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({ description: 'Thread creator information' })
  createdBy2: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ 
    description: 'Thread messages',
    type: [MessageResponseDto]
  })
  messages: MessageResponseDto[];

  @ApiProperty({ description: 'Total unread messages count' })
  unreadCount: number;
}
