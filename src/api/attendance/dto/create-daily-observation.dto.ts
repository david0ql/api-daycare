import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt } from 'class-validator';

export enum MoodEnum {
  HAPPY = 'happy',
  SAD = 'sad',
  TIRED = 'tired',
  ENERGETIC = 'energetic',
  CALM = 'calm',
  CRANKY = 'cranky',
  NEUTRAL = 'neutral',
}

export class CreateDailyObservationDto {
  @ApiProperty({ description: 'Child ID' })
  @IsInt()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Attendance ID' })
  @IsInt()
  @IsNotEmpty()
  attendanceId: number;

  @ApiProperty({ 
    description: 'Child mood',
    enum: MoodEnum,
    example: MoodEnum.HAPPY
  })
  @IsEnum(MoodEnum)
  mood: MoodEnum;

  @ApiProperty({ 
    description: 'General observations about the child',
    required: false
  })
  @IsString()
  @IsOptional()
  generalObservations?: string;
}
