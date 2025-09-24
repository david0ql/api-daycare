import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDto {
    @ApiProperty({ description: 'Search word', maxLength: 80 })
    @IsNotEmpty()
    @IsString()
    searchWord: string;
}
