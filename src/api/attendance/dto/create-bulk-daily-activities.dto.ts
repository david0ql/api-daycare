import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityTypeEnum } from './create-daily-activity.dto';

export class BulkActivityItemDto {
  @ApiProperty({ enum: ActivityTypeEnum, description: 'Activity type' })
  @IsEnum(ActivityTypeEnum)
  activityType: ActivityTypeEnum;

  @ApiProperty({
    required: false,
    enum: [0, 1, 2],
    default: 0,
    description: '0=pending, 1=completed, 2=rejected',
  })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  completed?: number;

  @ApiProperty({ required: false, description: 'Time when activity was completed' })
  @IsOptional()
  timeCompleted?: Date;

  @ApiProperty({ required: false, description: 'Notes about the activity' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateBulkDailyActivitiesDto {
  @ApiProperty({ description: 'Child ID' })
  @IsInt()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Attendance record ID' })
  @IsInt()
  @IsNotEmpty()
  attendanceId: number;

  @ApiProperty({ type: [BulkActivityItemDto], description: 'List of activities to create' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkActivityItemDto)
  activities: BulkActivityItemDto[];
}
