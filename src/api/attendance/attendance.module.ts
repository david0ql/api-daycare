import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DailyAttendanceEntity } from 'src/entities/daily_attendance.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { AuthorizedPickupPersonsEntity } from 'src/entities/authorized_pickup_persons.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyAttendanceEntity,
      ChildrenEntity,
      AuthorizedPickupPersonsEntity,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}