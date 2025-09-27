import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateParentChildRelationshipDto {
  @ApiProperty({
    description: 'Parent user ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  parentId: number;

  @ApiProperty({
    description: 'Child ID',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  childId?: number;

  @ApiProperty({
    description: 'Relationship type',
    enum: ['father', 'mother', 'guardian', 'other'],
    example: 'father',
  })
  @IsEnum(['father', 'mother', 'guardian', 'other'])
  @IsNotEmpty()
  relationshipType: 'father' | 'mother' | 'guardian' | 'other';

  @ApiProperty({
    description: 'Is primary relationship',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = false;
}
