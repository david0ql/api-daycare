import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class WeeklyPaymentReportDto {
  @ApiPropertyOptional({
    description: 'Start date of the week (defaults to current week start)',
    example: '2026-02-09',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the week (defaults to current week end)',
    example: '2026-02-15',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
