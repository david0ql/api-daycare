import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateActivityPhotoDto {
  @ApiProperty({ description: 'Child ID' })
  @IsInt()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({ description: 'Attendance ID' })
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
