import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateActivityPhotoDto {
  @ApiProperty({ description: 'Child ID' })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Attendance ID' })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsNotEmpty()
  attendanceId: number;

  @ApiProperty({ 
    description: 'Photo caption',
    required: false
  })
  @IsString()
  @IsOptional()
  caption?: string;
}
