import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, IsInt } from 'class-validator';

export enum ActivityTypeEnum {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  SNACK = 'snack',
  NAP = 'nap',
  DIAPER_CHANGE = 'diaper_change',
  CLOTHING_CHANGE = 'clothing_change',
  HYDRATION = 'hydration',
  OTHER = 'other',
}

export class CreateDailyActivityDto {
  @ApiProperty({ description: 'Child ID' })
  @IsInt()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Attendance ID' })
  @IsInt()
  @IsNotEmpty()
  attendanceId: number;

  @ApiProperty({ 
    description: 'Activity type',
    enum: ActivityTypeEnum,
    example: ActivityTypeEnum.BREAKFAST
  })
  @IsEnum(ActivityTypeEnum)
  activityType: ActivityTypeEnum;

  @ApiProperty({ 
    description: 'Whether the activity is completed',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiProperty({ 
    description: 'Time when the activity was completed',
    required: false
  })
  @IsOptional()
  timeCompleted?: Date;

  @ApiProperty({ 
    description: 'Notes about the activity',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
