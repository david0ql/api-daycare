import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsBoolean, IsEnum } from 'class-validator';

export enum EventTypeEnum {
  HOLIDAY = 'holiday',
  VACATION = 'vacation',
  MEETING = 'meeting',
  EVENT = 'event',
  CLOSURE = 'closure',
}

export class CreateCalendarEventDto {
  @ApiProperty({ description: 'Event title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Event description',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Event type',
    enum: EventTypeEnum,
    example: EventTypeEnum.EVENT
  })
  @IsEnum(EventTypeEnum)
  eventType: EventTypeEnum;

  @ApiProperty({ 
    description: 'Event start date',
    example: '2024-01-15'
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ 
    description: 'Event end date',
    example: '2024-01-15'
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ 
    description: 'Whether the event is all day',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;

  @ApiProperty({ 
    description: 'Event start time (required if not all day)',
    example: '09:00',
    required: false
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ 
    description: 'Event end time (required if not all day)',
    example: '17:00',
    required: false
  })
  @IsString()
  @IsOptional()
  endTime?: string;
}
