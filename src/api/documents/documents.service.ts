import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentsEntity } from 'src/entities/documents.entity';
import { DocumentTypesEntity } from 'src/entities/document_types.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { PageDto } from 'src/dto/page.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import { FileUploadService } from './services/file-upload.service';
import { Express } from 'express';
import moment from 'moment';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentsEntity)
    private readonly documentsRepository: Repository<DocumentsEntity>,
    @InjectRepository(DocumentTypesEntity)
    private readonly documentTypesRepository: Repository<DocumentTypesEntity>,
    @InjectRepository(ChildrenEntity)
    private readonly childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    currentUserId: number,
  ): Promise<DocumentsEntity> {
    const { childId, documentTypeId, filename, originalFilename, filePath, fileSize, mimeType, expiresAt } = createDocumentDto;

    // Verify child exists
    const child = await this.childrenRepository.findOne({ where: { id: childId } });
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Verify document type exists
    const documentType = await this.documentTypesRepository.findOne({ where: { id: documentTypeId } });
    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    // Calculate expiration date if not provided
    let expirationDate: Date | null = null;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
    } else if (documentType.retentionDays) {
      expirationDate = moment().add(documentType.retentionDays, 'days').toDate();
    }

    const document = this.documentsRepository.create({
      childId,
      documentTypeId,
      filename,
      originalFilename,
      filePath,
      fileSize,
      mimeType,
      uploadedBy: currentUserId,
      expiresAt: expirationDate,
    });

    return this.documentsRepository.save(document);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    currentUserId: number,
    currentUserRole: string,
  ): Promise<PageDto<DocumentsEntity>> {
    console.log('🔍 DocumentsService.findAll - currentUserId:', currentUserId);
    console.log('🔍 DocumentsService.findAll - currentUserRole:', currentUserRole);
    console.log('🔍 DocumentsService.findAll - pageOptionsDto:', pageOptionsDto);

    const queryBuilder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.child', 'child')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.uploadedBy2', 'uploadedBy');

    // If user is parent, only show documents for their children
    if (currentUserRole === 'parent') {
      queryBuilder
        .leftJoin('child.parentChildRelationships', 'pcr')
        .where('pcr.parentId = :userId', { userId: currentUserId });
    }

    queryBuilder
      .orderBy('document.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    console.log('🔍 DocumentsService.findAll - total count:', total);
    
    const documents = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();
    
    console.log('🔍 DocumentsService.findAll - documents found:', documents.length);
    console.log('🔍 DocumentsService.findAll - documents:', documents);

    // Add expiration information to each document
    const documentsWithExpiration = documents.map(doc => ({
      ...doc,
      isExpired: doc.expiresAt ? moment().isAfter(moment(doc.expiresAt)) : false,
      daysUntilExpiration: doc.expiresAt ? moment(doc.expiresAt).diff(moment(), 'days') : null,
    }));

    const pageMeta = new PageMetaDto({ pageOptionsDto, totalCount: total });

    return new PageDto(documentsWithExpiration, pageMeta);
  }

  async findOne(id: number, currentUserId: number, currentUserRole: string): Promise<DocumentsEntity> {
    const queryBuilder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.child', 'child')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.uploadedBy2', 'uploadedBy')
      .where('document.id = :id', { id });

    // If user is parent, only show documents for their children
    if (currentUserRole === 'parent') {
      queryBuilder
        .leftJoin('child.parentChildRelationships', 'pcr')
        .andWhere('pcr.parentId = :userId', { userId: currentUserId });
    }

    const document = await queryBuilder.getOne();

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Add expiration information
    return {
      ...document,
      isExpired: document.expiresAt ? moment().isAfter(moment(document.expiresAt)) : false,
      daysUntilExpiration: document.expiresAt ? moment(document.expiresAt).diff(moment(), 'days') : null,
    } as any;
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    currentUserId: number,
  ): Promise<DocumentsEntity> {
    const document = await this.documentsRepository.findOne({
      where: { id, uploadedBy: currentUserId },
    });

    if (!document) {
      throw new NotFoundException('Document not found or you are not the uploader');
    }

    // If updating document type, verify it exists
    if (updateDocumentDto.documentTypeId) {
      const documentType = await this.documentTypesRepository.findOne({
        where: { id: updateDocumentDto.documentTypeId },
      });
      if (!documentType) {
        throw new NotFoundException('Document type not found');
      }
    }

    // If updating child, verify child exists
    if (updateDocumentDto.childId) {
      const child = await this.childrenRepository.findOne({
        where: { id: updateDocumentDto.childId },
      });
      if (!child) {
        throw new NotFoundException('Child not found');
      }
    }

    const updateData = {
      ...updateDocumentDto,
      expiresAt: updateDocumentDto.expiresAt ? new Date(updateDocumentDto.expiresAt) : undefined,
    };

    await this.documentsRepository.update(id, updateData);

    return this.findOne(id, currentUserId, 'administrator'); // Assuming admin can see all
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id, uploadedBy: currentUserId },
    });

    if (!document) {
      throw new NotFoundException('Document not found or you are not the uploader');
    }

    await this.documentsRepository.remove(document);
  }

  async getDocumentTypes(): Promise<DocumentTypesEntity[]> {
    return this.documentTypesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async getDocumentTypesWithCount(): Promise<any[]> {
    const documentTypes = await this.documentTypesRepository
      .createQueryBuilder('dt')
      .leftJoinAndSelect('dt.documents', 'documents')
      .orderBy('dt.name', 'ASC')
      .getMany();

    return documentTypes.map(type => ({
      ...type,
      documentCount: type.documents.length,
    }));
  }

  async seedDocumentTypes(): Promise<DocumentTypesEntity[]> {
    // Check if document types already exist
    const existingTypes = await this.documentTypesRepository.find();
    if (existingTypes.length > 0) {
      return existingTypes;
    }

    // Insert document types
    const documentTypes = [
      {
        name: 'birth_certificate',
        description: 'Birth certificate document',
        retentionDays: 2555, // 7 years
      },
      {
        name: 'vaccination_record',
        description: 'Vaccination records',
        retentionDays: 1825, // 5 years
      },
      {
        name: 'authorization_form',
        description: 'Authorization forms',
        retentionDays: 365, // 1 year
      },
      {
        name: 'medical_record',
        description: 'Medical records and prescriptions',
        retentionDays: 1825, // 5 years
      },
      {
        name: 'emergency_contact',
        description: 'Emergency contact information',
        retentionDays: 365, // 1 year
      },
      {
        name: 'insurance_card',
        description: 'Insurance card copy',
        retentionDays: 365, // 1 year
      },
      {
        name: 'other',
        description: 'Other documents',
        retentionDays: 365, // 1 year
      },
    ];

    const createdTypes: DocumentTypesEntity[] = [];
    for (const docType of documentTypes) {
      const documentType = this.documentTypesRepository.create(docType);
      const saved = await this.documentTypesRepository.save(documentType);
      createdTypes.push(saved);
    }

    return createdTypes;
  }

  async getDocumentsByChild(
    childId: number,
    pageOptionsDto: PageOptionsDto,
    currentUserId: number,
    currentUserRole: string,
  ): Promise<PageDto<DocumentsEntity>> {
    // Verify child exists
    const child = await this.childrenRepository.findOne({ where: { id: childId } });
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // If user is parent, verify they have access to this child
    if (currentUserRole === 'parent') {
      const hasAccess = await this.childrenRepository
        .createQueryBuilder('child')
        .leftJoin('child.parentChildRelationships', 'pcr')
        .where('child.id = :childId', { childId })
        .andWhere('pcr.parentId = :userId', { userId: currentUserId })
        .getOne();

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this child');
      }
    }

    const queryBuilder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.child', 'child')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.uploadedBy2', 'uploadedBy')
      .where('document.childId = :childId', { childId })
      .orderBy('document.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const documents = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();

    // Add expiration information to each document
    const documentsWithExpiration = documents.map(doc => ({
      ...doc,
      isExpired: doc.expiresAt ? moment().isAfter(moment(doc.expiresAt)) : false,
      daysUntilExpiration: doc.expiresAt ? moment(doc.expiresAt).diff(moment(), 'days') : null,
    }));

    const pageMeta = new PageMetaDto({ pageOptionsDto, totalCount: total });

    return new PageDto(documentsWithExpiration, pageMeta);
  }

  async getDocumentsByType(
    documentTypeId: number,
    pageOptionsDto: PageOptionsDto,
    currentUserId: number,
    currentUserRole: string,
  ): Promise<PageDto<DocumentsEntity>> {
    // Verify document type exists
    const documentType = await this.documentTypesRepository.findOne({
      where: { id: documentTypeId },
    });
    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    const queryBuilder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.child', 'child')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.uploadedBy2', 'uploadedBy')
      .where('document.documentTypeId = :documentTypeId', { documentTypeId });

    // If user is parent, only show documents for their children
    if (currentUserRole === 'parent') {
      queryBuilder
        .leftJoin('child.parentChildRelationships', 'pcr')
        .andWhere('pcr.parentId = :userId', { userId: currentUserId });
    }

    queryBuilder
      .orderBy('document.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const documents = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();

    // Add expiration information to each document
    const documentsWithExpiration = documents.map(doc => ({
      ...doc,
      isExpired: doc.expiresAt ? moment().isAfter(moment(doc.expiresAt)) : false,
      daysUntilExpiration: doc.expiresAt ? moment(doc.expiresAt).diff(moment(), 'days') : null,
    }));

    const pageMeta = new PageMetaDto({ pageOptionsDto, totalCount: total });

    return new PageDto(documentsWithExpiration, pageMeta);
  }

  async getExpiringDocuments(daysUntilExpiration: number = 30): Promise<DocumentsEntity[]> {
    const expirationDate = moment().add(daysUntilExpiration, 'days').toDate();

    const documents = await this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.child', 'child')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.uploadedBy2', 'uploadedBy')
      .where('document.expiresAt IS NOT NULL')
      .andWhere('document.expiresAt <= :expirationDate', { expirationDate })
      .orderBy('document.expiresAt', 'ASC')
      .getMany();

    // Add expiration information to each document
    return documents.map(doc => ({
      ...doc,
      isExpired: doc.expiresAt ? moment().isAfter(moment(doc.expiresAt)) : false,
      daysUntilExpiration: doc.expiresAt ? moment(doc.expiresAt).diff(moment(), 'days') : null,
    })) as any;
  }

  async getExpiredDocuments(): Promise<DocumentsEntity[]> {
    const now = new Date();

    const documents = await this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.child', 'child')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.uploadedBy2', 'uploadedBy')
      .where('document.expiresAt IS NOT NULL')
      .andWhere('document.expiresAt < :now', { now })
      .orderBy('document.expiresAt', 'ASC')
      .getMany();

    // Add expiration information to each document
    return documents.map(doc => ({
      ...doc,
      isExpired: true,
      daysUntilExpiration: doc.expiresAt ? moment(doc.expiresAt).diff(moment(), 'days') : null,
    })) as any;
  }

  async uploadDocument(
    file: Express.Multer.File,
    uploadDocumentDto: UploadDocumentDto,
    currentUserId: number,
  ): Promise<DocumentsEntity> {
    const { childId, documentTypeId, expiresAt } = uploadDocumentDto;

    // Verify child exists
    const child = await this.childrenRepository.findOne({ where: { id: childId } });
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Verify document type exists
    const documentType = await this.documentTypesRepository.findOne({ where: { id: documentTypeId } });
    if (!documentType) {
      throw new NotFoundException('Document type not found');
    }

    // Check if document type can be uploaded multiple times (only 'other' type allows multiple uploads)
    const canUploadMultiple = documentType.name.toLowerCase() === 'other';
    
    if (!canUploadMultiple) {
      // Check if this document type already exists for this child
      const existingDocument = await this.documentsRepository.findOne({
        where: {
          childId,
          documentTypeId,
        },
      });

      if (existingDocument) {
        throw new BadRequestException(`Ya existe un documento de tipo "${documentType.name}" para este niño. Solo se permite un documento por tipo (excepto "Otros").`);
      }
    }

    // Save file to disk
    const fileInfo = await this.fileUploadService.saveFile(file, childId, documentTypeId);

    // Calculate expiration date
    let expirationDate: Date | null = null;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
    } else if (documentType.retentionDays) {
      expirationDate = this.fileUploadService.generateExpirationDate(documentType.retentionDays);
    }

    // Create document record
    const newDocument = this.documentsRepository.create({
      childId,
      documentTypeId,
      filename: fileInfo.filename,
      originalFilename: fileInfo.originalFilename,
      filePath: fileInfo.filePath,
      fileSize: fileInfo.fileSize,
      mimeType: fileInfo.mimeType,
      uploadedBy: currentUserId,
      expiresAt: expirationDate,
    });

    console.log('🔍 DocumentsService.uploadDocument - saving document:', newDocument);
    const savedDocument = await this.documentsRepository.save(newDocument);
    console.log('🔍 DocumentsService.uploadDocument - saved document:', savedDocument);

    // Return document with relations
    const retrievedDocument = await this.documentsRepository.findOne({
      where: { id: savedDocument.id },
      relations: ['child', 'documentType', 'uploadedBy2'],
    });

    if (!retrievedDocument) {
      throw new NotFoundException('Failed to retrieve created document');
    }

    console.log('🔍 DocumentsService.uploadDocument - retrieved document:', retrievedDocument);
    return retrievedDocument;
  }

  async downloadDocument(id: number, currentUserId: number, currentUserRole: string): Promise<{
    filePath: string;
    filename: string;
    mimeType: string;
  }> {
    const queryBuilder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.child', 'child')
      .where('document.id = :id', { id });

    // If user is parent, only allow access to documents for their children
    if (currentUserRole === 'parent') {
      queryBuilder
        .leftJoin('child.parentChildRelationships', 'pcr')
        .andWhere('pcr.parentId = :userId', { userId: currentUserId });
    }

    const document = await queryBuilder.getOne();

    if (!document) {
      throw new NotFoundException('Document not found or access denied');
    }

    return {
      filePath: document.filePath,
      filename: document.originalFilename,
      mimeType: document.mimeType,
    };
  }

  async deleteDocumentFile(id: number, currentUserId: number): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id, uploadedBy: currentUserId },
    });

    if (!document) {
      throw new NotFoundException('Document not found or you are not the uploader');
    }

    // Delete file from disk
    try {
      const fs = require('fs');
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete document record from database
    await this.documentsRepository.remove(document);
  }

  async getDocumentFileUrl(id: number, currentUserId: number, currentUserRole: string): Promise<{
    url: string;
    downloadUrl: string;
    filename: string;
    mimeType: string;
  }> {
    const queryBuilder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.child', 'child')
      .where('document.id = :id', { id });

    // If user is parent, only allow access to documents for their children
    if (currentUserRole === 'parent') {
      queryBuilder
        .leftJoin('child.parentChildRelationships', 'pcr')
        .andWhere('pcr.parentId = :userId', { userId: currentUserId });
    }

    const document = await queryBuilder.getOne();

    if (!document) {
      throw new NotFoundException('Document not found or access denied');
    }

    return {
      url: `/static/files/documents/${document.filename}`,
      downloadUrl: `/static/files/documents/${document.filename}/download`,
      filename: document.originalFilename,
      mimeType: document.mimeType,
    };
  }
}