import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { StaticFilesController } from './static-files.controller';
import { FileUploadService } from './services/file-upload.service';
import { StaticFileAuthGuard } from './guards/static-file-auth.guard';
import { DocumentsEntity } from 'src/entities/documents.entity';
import { DocumentTypesEntity } from 'src/entities/document_types.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { UsersEntity } from 'src/entities/users.entity';
import envVars from 'src/config/env';

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
    JwtModule.register({
      secret: envVars.JWT_SECRET,
    }),
  ],
  controllers: [DocumentsController, StaticFilesController],
  providers: [DocumentsService, FileUploadService, StaticFileAuthGuard],
  exports: [DocumentsService, FileUploadService, StaticFileAuthGuard],
})
export class DocumentsModule {}