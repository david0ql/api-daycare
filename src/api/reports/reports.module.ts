import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ChildrenEntity } from 'src/entities/children.entity';
import { DailyAttendanceEntity } from 'src/entities/daily_attendance.entity';
import { IncidentsEntity } from 'src/entities/incidents.entity';
import { DailyActivitiesEntity } from 'src/entities/daily_activities.entity';
import { DailyObservationsEntity } from 'src/entities/daily_observations.entity';
import { ActivityPhotosEntity } from 'src/entities/activity_photos.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChildrenEntity,
      DailyAttendanceEntity,
      IncidentsEntity,
      DailyActivitiesEntity,
      DailyObservationsEntity,
      ActivityPhotosEntity,
    ]),
    SharedModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}