import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MarkParentNotifiedDto {
  @ApiProperty({ description: 'Incident ID to mark as parent notified' })
  @IsNumber()
  @IsNotEmpty()
  incidentId: number;
}
