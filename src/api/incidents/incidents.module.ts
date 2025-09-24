import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { IncidentsEntity } from 'src/entities/incidents.entity';
import { IncidentTypesEntity } from 'src/entities/incident_types.entity';
import { IncidentAttachmentsEntity } from 'src/entities/incident_attachments.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentsEntity,
      IncidentTypesEntity,
      IncidentAttachmentsEntity,
      ChildrenEntity,
      UsersEntity,
    ]),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}