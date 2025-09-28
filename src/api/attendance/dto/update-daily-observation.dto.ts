import { PartialType } from '@nestjs/swagger';
import { CreateDailyObservationDto } from './create-daily-observation.dto';

export class UpdateDailyObservationDto extends PartialType(CreateDailyObservationDto) {}
