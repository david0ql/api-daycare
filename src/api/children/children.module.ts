import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { ChildrenEntity } from 'src/entities/children.entity';
import { ParentChildRelationshipsEntity } from 'src/entities/parent_child_relationships.entity';
import { EmergencyContactsEntity } from 'src/entities/emergency_contacts.entity';
import { AuthorizedPickupPersonsEntity } from 'src/entities/authorized_pickup_persons.entity';
import { MedicalInformationEntity } from 'src/entities/medical_information.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChildrenEntity,
      ParentChildRelationshipsEntity,
      EmergencyContactsEntity,
      AuthorizedPickupPersonsEntity,
      MedicalInformationEntity,
      UsersEntity,
    ]),
    SharedModule,
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}