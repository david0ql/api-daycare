import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { FileUploadService } from './services/file-upload.service';
import { DocumentsEntity } from 'src/entities/documents.entity';
import { DocumentTypesEntity } from 'src/entities/document_types.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { UsersEntity } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentsEntity,
      DocumentTypesEntity,
      ChildrenEntity,
      UsersEntity,
    ]),
    MulterModule.register({
      dest: './uploads/documents',
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, FileUploadService],
  exports: [DocumentsService, FileUploadService],
})
export class DocumentsModule {}