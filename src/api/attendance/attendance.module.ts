import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DailyActivitiesService } from './daily-activities.service';
import { DailyActivitiesController } from './daily-activities.controller';
import { DailyObservationsService } from './daily-observations.service';
import { DailyObservationsController } from './daily-observations.controller';
import { ActivityPhotosService } from './activity-photos.service';
import { ActivityPhotosController } from './activity-photos.controller';
import { DailyAttendanceEntity } from 'src/entities/daily_attendance.entity';
import { DailyActivitiesEntity } from 'src/entities/daily_activities.entity';
import { DailyObservationsEntity } from 'src/entities/daily_observations.entity';
import { ActivityPhotosEntity } from 'src/entities/activity_photos.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { AuthorizedPickupPersonsEntity } from 'src/entities/authorized_pickup_persons.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { FileUploadService } from './services/file-upload.service';
import { StaticFilesController } from './static-files.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyAttendanceEntity,
      DailyActivitiesEntity,
      DailyObservationsEntity,
      ActivityPhotosEntity,
      ChildrenEntity,
      AuthorizedPickupPersonsEntity,
      UsersEntity,
    ]),
    MulterModule.register({
      dest: './uploads/activity-photos',
    }),
    SharedModule,
  ],
  controllers: [
    AttendanceController,
    DailyActivitiesController,
    DailyObservationsController,
    ActivityPhotosController,
    StaticFilesController,
  ],
  providers: [
    AttendanceService,
    DailyActivitiesService,
    DailyObservationsService,
    ActivityPhotosService,
    FileUploadService,
  ],
  exports: [
    AttendanceService,
    DailyActivitiesService,
    DailyObservationsService,
    ActivityPhotosService,
    FileUploadService,
  ],
})
export class AttendanceModule {}