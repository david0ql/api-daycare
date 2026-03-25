import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class BulkUpdateItemDto {
  @ApiProperty({ description: 'Activity ID to update' })
  @IsInt()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ required: false, enum: [0, 1, 2], description: '0=pending, 1=completed, 2=rejected' })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  completed?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  timeCompleted?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBulkDailyActivitiesDto {
  @ApiProperty({ type: [BulkUpdateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateItemDto)
  updates: BulkUpdateItemDto[];
}
