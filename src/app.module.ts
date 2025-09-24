import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';

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
  ],
  controllers: [],
  providers: [],
})

export class AppModule { }
