import { ApiProperty } from '@nestjs/swagger';
import { EventTypeEnum } from './create-calendar-event.dto';

export class CalendarEventResponseDto {
  @ApiProperty({ description: 'Event ID' })
  id: number;

  @ApiProperty({ description: 'Event title' })
  title: string;

  @ApiProperty({ description: 'Event description', nullable: true })
  description: string | null;

  @ApiProperty({ 
    description: 'Event type',
    enum: EventTypeEnum
  })
  eventType: EventTypeEnum;

  @ApiProperty({ description: 'Event start date' })
  startDate: string;

  @ApiProperty({ description: 'Event end date' })
  endDate: string;

  @ApiProperty({ description: 'Whether the event is all day' })
  isAllDay: boolean;

  @ApiProperty({ description: 'Event start time', nullable: true })
  startTime: string | null;

  @ApiProperty({ description: 'Event end time', nullable: true })
  endTime: string | null;

  @ApiProperty({ description: 'User ID who created the event' })
  createdBy: number;

  @ApiProperty({ description: 'Event creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Event last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'User who created the event' })
  createdBy2: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ description: 'Whether the event is currently happening' })
  isCurrent: boolean;

  @ApiProperty({ description: 'Whether the event has passed' })
  isPast: boolean;

  @ApiProperty({ description: 'Whether the event is in the future' })
  isFuture: boolean;
}
