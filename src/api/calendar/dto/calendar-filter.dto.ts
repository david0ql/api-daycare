import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { EventTypeEnum } from './create-calendar-event.dto';

export class CalendarFilterDto {
  @ApiProperty({ 
    description: 'Filter events from this date',
    example: '2024-01-01',
    required: false
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ 
    description: 'Filter events until this date',
    example: '2024-12-31',
    required: false
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ 
    description: 'Filter by event type',
    enum: EventTypeEnum,
    required: false
  })
  @IsEnum(EventTypeEnum)
  @IsOptional()
  eventType?: EventTypeEnum;

  @ApiProperty({ 
    description: 'Include only current events (happening today)',
    required: false,
    default: false
  })
  @IsOptional()
  currentOnly?: boolean;

  @ApiProperty({ 
    description: 'Include only upcoming events (future dates)',
    required: false,
    default: false
  })
  @IsOptional()
  upcomingOnly?: boolean;
}
