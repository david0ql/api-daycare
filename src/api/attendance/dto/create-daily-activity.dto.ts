import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max } from 'class-validator';

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
    description: 'Activity status: 0=pending, 1=completed, 2=rejected',
    default: 0,
    enum: [0, 1, 2],
  })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  completed?: number;

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
