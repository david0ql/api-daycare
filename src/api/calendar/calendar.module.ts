import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CalendarEventsEntity } from 'src/entities/calendar_events.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarEventsEntity,
      UsersEntity,
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}