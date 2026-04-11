import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckOutDto {
  @ApiProperty({
    description: 'Child ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  childId: number;

  @ApiProperty({
    description: 'ID of person who picked up the child',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  pickedUpBy: number;

  @ApiProperty({
    description: 'Check-out notes',
    example: 'Child had a great day, played well with others',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
