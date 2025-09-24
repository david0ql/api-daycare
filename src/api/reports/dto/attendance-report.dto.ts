import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export class AttendanceReportDto {
  @ApiProperty({
    description: 'Start date for the report',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date for the report',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
