import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @ApiProperty({
    description: 'Child ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({
    description: 'ID of person who delivered the child',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  deliveredBy?: number;

  @ApiProperty({
    description: 'Check-in notes',
    example: 'Child arrived happy and well-rested',
    required: false,
  })
  @IsString()
  @IsOptional()
  checkInNotes?: string;
}
