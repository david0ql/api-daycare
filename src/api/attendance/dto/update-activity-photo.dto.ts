import { PartialType } from '@nestjs/swagger';
import { CreateActivityPhotoDto } from './create-activity-photo.dto';

export class UpdateActivityPhotoDto extends PartialType(CreateActivityPhotoDto) {}
