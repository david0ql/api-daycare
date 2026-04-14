import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentFilterService } from './services/parent-filter.service';
import { ParentChildRelationshipsEntity } from 'src/entities/parent_child_relationships.entity';
import { DateHelper } from './utils/date-helper';

@Module({
  imports: [TypeOrmModule.forFeature([ParentChildRelationshipsEntity])],
  providers: [ParentFilterService, DateHelper],
  exports: [ParentFilterService, DateHelper],
})
export class SharedModule {}
