import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MarkMessageReadDto {
  @ApiProperty({ description: 'Message ID to mark as read' })
  @IsNumber()
  @IsNotEmpty()
  messageId: number;
}
