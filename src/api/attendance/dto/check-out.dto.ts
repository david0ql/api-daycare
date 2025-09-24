import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
    description: 'Check-out notes (required)',
    example: 'Child had a great day, played well with others',
  })
  @IsString()
  @IsNotEmpty()
  checkOutNotes: string;
}
