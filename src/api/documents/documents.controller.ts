import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/api/auth/guards/roles.guard';
import { Roles } from 'src/api/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/api/auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { createReadStream } from 'fs';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Child or document type not found',
  })
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.create(createDocumentDto, currentUser.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents (filtered by user role)' })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.findAll(pageOptionsDto, currentUser.id, currentUser.role.name);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all document types' })
  @ApiResponse({
    status: 200,
    description: 'Document types retrieved successfully',
  })
  getDocumentTypes() {
    return this.documentsService.getDocumentTypes();
  }

  @Get('types/with-count')
  @ApiOperation({ summary: 'Get document types with document counts' })
  @ApiResponse({
    status: 200,
    description: 'Document types with counts retrieved successfully',
  })
  getDocumentTypesWithCount() {
    return this.documentsService.getDocumentTypesWithCount();
  }

  @Get('expiring')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Get documents expiring within specified days (default 30)' })
  @ApiResponse({
    status: 200,
    description: 'Expiring documents retrieved successfully',
  })
  getExpiringDocuments(
    @Query('days') days: string = '30',
  ) {
    return this.documentsService.getExpiringDocuments(+days);
  }

  @Get('expired')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Get all expired documents' })
  @ApiResponse({
    status: 200,
    description: 'Expired documents retrieved successfully',
  })
  getExpiredDocuments() {
    return this.documentsService.getExpiredDocuments();
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get documents for a specific child' })
  @ApiResponse({
    status: 200,
    description: 'Child documents retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied to child information',
  })
  getDocumentsByChild(
    @Param('childId') childId: string,
    @Query() pageOptionsDto: PageOptionsDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.getDocumentsByChild(
      +childId,
      pageOptionsDto,
      currentUser.id,
      currentUser.role.name,
    );
  }

  @Get('type/:documentTypeId')
  @ApiOperation({ summary: 'Get documents by document type' })
  @ApiResponse({
    status: 200,
    description: 'Documents by type retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document type not found',
  })
  getDocumentsByType(
    @Param('documentTypeId') documentTypeId: string,
    @Query() pageOptionsDto: PageOptionsDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.getDocumentsByType(
      +documentTypeId,
      pageOptionsDto,
      currentUser.id,
      currentUser.role.name,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.findOne(+id, currentUser.id, currentUser.role.name);
  }

  @Patch(':id')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Update a document (only by uploader)' })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found or user not authorized',
  })
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.update(+id, updateDocumentDto, currentUser.id);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Delete a document (only by uploader)' })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found or user not authorized',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.remove(+id, currentUser.id);
  }

  @Post('upload')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload',
        },
        childId: {
          type: 'number',
          description: 'Child ID to associate the document with',
        },
        documentTypeId: {
          type: 'number',
          description: 'Document type ID',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'Document expiration date (optional)',
        },
      },
      required: ['file', 'childId', 'documentTypeId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Child or document type not found',
  })
  uploadDocument(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.uploadDocument(file, uploadDocumentDto, currentUser.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document file' })
  @ApiResponse({
    status: 200,
    description: 'Document downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found or access denied',
  })
  async downloadDocument(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fileInfo = await this.documentsService.downloadDocument(
      +id,
      currentUser.id,
      currentUser.role.name,
    );

    const file = createReadStream(fileInfo.filePath);
    
    res.set({
      'Content-Type': fileInfo.mimeType,
      'Content-Disposition': `attachment; filename="${fileInfo.filename}"`,
    });

    return new StreamableFile(file);
  }

  @Delete(':id/file')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Delete a document file (only by uploader)' })
  @ApiResponse({
    status: 200,
    description: 'Document file deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found or user not authorized',
  })
  deleteDocumentFile(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.deleteDocumentFile(+id, currentUser.id);
  }

  @Get(':id/file-url')
  @ApiOperation({ summary: 'Get authenticated file URLs for a document' })
  @ApiResponse({
    status: 200,
    description: 'File URLs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL to view the file inline',
          example: '/static/files/documents/550e8400-e29b-41d4-a716-446655440000.pdf'
        },
        downloadUrl: {
          type: 'string',
          description: 'URL to download the file',
          example: '/static/files/documents/550e8400-e29b-41d4-a716-446655440000.pdf/download'
        },
        filename: {
          type: 'string',
          description: 'Original filename',
          example: 'document.pdf'
        },
        mimeType: {
          type: 'string',
          description: 'MIME type of the file',
          example: 'application/pdf'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found or access denied',
  })
  getDocumentFileUrl(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.documentsService.getDocumentFileUrl(+id, currentUser.id, currentUser.role.name);
  }
}