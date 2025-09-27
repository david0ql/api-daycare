import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'Child ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({
    description: 'Attendance date',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  attendanceDate: string;

  @ApiProperty({
    description: 'Check-in time',
    example: '2024-01-15T08:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  checkInTime?: string;

  @ApiProperty({
    description: 'Check-out time',
    example: '2024-01-15T17:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  checkOutTime?: string;

  @ApiProperty({
    description: 'ID of person who delivered the child',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  deliveredBy?: number;

  @ApiProperty({
    description: 'ID of person who picked up the child',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  pickedUpBy?: number;

  @ApiProperty({
    description: 'Check-in notes',
    example: 'Child arrived happy and well-rested',
    required: false,
  })
  @IsString()
  @IsOptional()
  checkInNotes?: string;

  @ApiProperty({
    description: 'Check-out notes',
    example: 'Child had a great day, played well with others',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}