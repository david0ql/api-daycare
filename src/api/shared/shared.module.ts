import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentFilterService } from './services/parent-filter.service';
import { ParentChildRelationshipsEntity } from 'src/entities/parent_child_relationships.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParentChildRelationshipsEntity])],
  providers: [ParentFilterService],
  exports: [ParentFilterService],
})
export class SharedModule {}
