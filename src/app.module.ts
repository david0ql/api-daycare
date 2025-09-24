import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { ChildrenModule } from './api/children/children.module';
import { AttendanceModule } from './api/attendance/attendance.module';
import { MessagingModule } from './api/messaging/messaging.module';
import { IncidentsModule } from './api/incidents/incidents.module';
import { DocumentsModule } from './api/documents/documents.module';
import { CalendarModule } from './api/calendar/calendar.module';
import { ReportsModule } from './api/reports/reports.module';

import envVars from './config/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      username: envVars.DB_USERNAME,
      password: envVars.DB_PASSWORD,
      database: envVars.DB_DATABASE,
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    ChildrenModule,
    AttendanceModule,
    MessagingModule,
    IncidentsModule,
    DocumentsModule,
    CalendarModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule { }
