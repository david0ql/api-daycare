import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import envVars from './env';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: envVars.DB_HOST,
  port: envVars.DB_PORT,
  username: envVars.DB_USERNAME,
  password: envVars.DB_PASSWORD,
  database: envVars.DB_DATABASE,
  entities: [__dirname + '/../../entities/*.entity{.ts,.js}'],
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
};
