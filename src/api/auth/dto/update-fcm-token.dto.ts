import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({ description: 'Firebase Cloud Messaging token' })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
