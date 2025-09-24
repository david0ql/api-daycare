import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChildReportDto {
  @ApiProperty({
    description: 'Child ID for the report',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({
    description: 'Start date for the report',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date for the report',
    example: '2024-01-31',
  })
  @IsNotEmpty()
  endDate: string;
}
