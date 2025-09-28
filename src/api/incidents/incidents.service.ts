import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { MarkParentNotifiedDto } from './dto/mark-parent-notified.dto';
import { CreateIncidentAttachmentDto } from './dto/create-incident-attachment.dto';
import { IncidentsEntity } from 'src/entities/incidents.entity';
import { IncidentTypesEntity } from 'src/entities/incident_types.entity';
import { IncidentAttachmentsEntity } from 'src/entities/incident_attachments.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { PageDto } from 'src/dto/page.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import { IncidentFileUploadService } from './services/incident-file-upload.service';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(IncidentsEntity)
    private readonly incidentsRepository: Repository<IncidentsEntity>,
    @InjectRepository(IncidentTypesEntity)
    private readonly incidentTypesRepository: Repository<IncidentTypesEntity>,
    @InjectRepository(IncidentAttachmentsEntity)
    private readonly incidentAttachmentsRepository: Repository<IncidentAttachmentsEntity>,
    @InjectRepository(ChildrenEntity)
    private readonly childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly dataSource: DataSource,
        private readonly fileUploadService: IncidentFileUploadService,
  ) {}

  async create(
    createIncidentDto: CreateIncidentDto,
    currentUserId: number,
  ): Promise<IncidentsEntity> {
    const { childId, incidentTypeId, title, description, incidentDate, location, actionTaken } = createIncidentDto;

    // Verify child exists
    const child = await this.childrenRepository.findOne({ where: { id: childId } });
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Verify incident type exists
    const incidentType = await this.incidentTypesRepository.findOne({ where: { id: incidentTypeId } });
    if (!incidentType) {
      throw new NotFoundException('Incident type not found');
    }

    const incident = this.incidentsRepository.create({
      childId,
      incidentTypeId,
      title,
      description,
      incidentDate: new Date(incidentDate),
      location: location || null,
      actionTaken: actionTaken || null,
      reportedBy: currentUserId,
      parentNotified: false,
    });

    return this.incidentsRepository.save(incident);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    currentUserId: number,
    currentUserRole: string,
  ): Promise<PageDto<IncidentsEntity>> {
    const queryBuilder = this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.child', 'child')
      .leftJoinAndSelect('incident.incidentType', 'incidentType')
      .leftJoinAndSelect('incident.reportedBy2', 'reportedBy')
      .leftJoinAndSelect('incident.incidentAttachments', 'attachments')
      .leftJoinAndSelect('attachments.uploadedBy2', 'uploadedBy');

    // If user is parent, only show incidents for their children
    if (currentUserRole === 'parent') {
      queryBuilder
        .leftJoin('child.parentChildRelationships', 'pcr')
        .where('pcr.parentId = :userId', { userId: currentUserId });
    }

    queryBuilder
      .orderBy('incident.incidentDate', 'DESC')
      .addOrderBy('incident.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const incidents = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();

    const pageMeta = new PageMetaDto({ pageOptionsDto, totalCount: total });

    return new PageDto(incidents, pageMeta);
  }

  async findOne(id: number, currentUserId: number, currentUserRole: string): Promise<IncidentsEntity> {
    const queryBuilder = this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.child', 'child')
      .leftJoinAndSelect('incident.incidentType', 'incidentType')
      .leftJoinAndSelect('incident.reportedBy2', 'reportedBy')
      .leftJoinAndSelect('incident.incidentAttachments', 'attachments')
      .leftJoinAndSelect('attachments.uploadedBy2', 'uploadedBy')
      .where('incident.id = :id', { id });

    // If user is parent, only show incidents for their children
    if (currentUserRole === 'parent') {
      queryBuilder
        .leftJoin('child.parentChildRelationships', 'pcr')
        .andWhere('pcr.parentId = :userId', { userId: currentUserId });
    }

    const incident = await queryBuilder.getOne();

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    return incident;
  }

  async update(
    id: number,
    updateIncidentDto: UpdateIncidentDto,
    currentUserId: number,
  ): Promise<IncidentsEntity> {
    const incident = await this.incidentsRepository.findOne({
      where: { id, reportedBy: currentUserId },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found or you are not the reporter');
    }

    // If updating incident type, verify it exists
    if (updateIncidentDto.incidentTypeId) {
      const incidentType = await this.incidentTypesRepository.findOne({
        where: { id: updateIncidentDto.incidentTypeId },
      });
      if (!incidentType) {
        throw new NotFoundException('Incident type not found');
      }
    }

    // If updating child, verify child exists
    if (updateIncidentDto.childId) {
      const child = await this.childrenRepository.findOne({
        where: { id: updateIncidentDto.childId },
      });
      if (!child) {
        throw new NotFoundException('Child not found');
      }
    }

    const updateData = {
      ...updateIncidentDto,
      incidentDate: updateIncidentDto.incidentDate ? new Date(updateIncidentDto.incidentDate) : undefined,
      updatedAt: new Date(),
    };

    await this.incidentsRepository.update(id, updateData);

    return this.findOne(id, currentUserId, 'administrator'); // Assuming admin can see all
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const incident = await this.incidentsRepository.findOne({
      where: { id, reportedBy: currentUserId },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found or you are not the reporter');
    }

    await this.incidentsRepository.remove(incident);
  }

  async markParentNotified(
    markParentNotifiedDto: MarkParentNotifiedDto,
    currentUserId: number,
  ): Promise<IncidentsEntity> {
    const { incidentId } = markParentNotifiedDto;

    const incident = await this.incidentsRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    // Only allow educators and administrators to mark as notified
    const user = await this.usersRepository.findOne({
      where: { id: currentUserId },
      relations: ['role'],
    });

    if (!user || (user.role.name !== 'educator' && user.role.name !== 'administrator')) {
      throw new ForbiddenException('Only educators and administrators can mark incidents as parent notified');
    }

    incident.parentNotified = true;
    incident.parentNotifiedAt = new Date();

    return this.incidentsRepository.save(incident);
  }

  async addAttachment(
    createIncidentAttachmentDto: CreateIncidentAttachmentDto,
    currentUserId: number,
  ): Promise<IncidentAttachmentsEntity> {
    const { incidentId, filename, filePath, fileType } = createIncidentAttachmentDto;

    // Verify incident exists
    const incident = await this.incidentsRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    const attachment = this.incidentAttachmentsRepository.create({
      incidentId,
      filename,
      filePath,
      fileType,
      uploadedBy: currentUserId,
    });

    return this.incidentAttachmentsRepository.save(attachment);
  }

  async removeAttachment(attachmentId: number, currentUserId: number): Promise<void> {
    const attachment = await this.incidentAttachmentsRepository.findOne({
      where: { id: attachmentId, uploadedBy: currentUserId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found or you are not the uploader');
    }

    await this.incidentAttachmentsRepository.remove(attachment);
  }

  async getIncidentTypes(): Promise<IncidentTypesEntity[]> {
    return this.incidentTypesRepository.find({
      order: { severityLevel: 'ASC', name: 'ASC' },
    });
  }

  async getIncidentsByChild(
    childId: number,
    pageOptionsDto: PageOptionsDto,
    currentUserId: number,
    currentUserRole: string,
  ): Promise<PageDto<IncidentsEntity>> {
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

    const queryBuilder = this.incidentsRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.child', 'child')
      .leftJoinAndSelect('incident.incidentType', 'incidentType')
      .leftJoinAndSelect('incident.reportedBy2', 'reportedBy')
      .leftJoinAndSelect('incident.incidentAttachments', 'attachments')
      .leftJoinAndSelect('attachments.uploadedBy2', 'uploadedBy')
      .where('incident.childId = :childId', { childId })
      .orderBy('incident.incidentDate', 'DESC');

    const total = await queryBuilder.getCount();
    const incidents = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();

    const pageMeta = new PageMetaDto({ pageOptionsDto, totalCount: total });

    return new PageDto(incidents, pageMeta);
  }

  async uploadAttachment(
    incidentId: number,
    file: Express.Multer.File,
    currentUserId: number,
  ): Promise<IncidentAttachmentsEntity> {
    // Verify incident exists
    const incident = await this.incidentsRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    // Save file using IncidentFileUploadService
    const { filename, filePath, fileSize, mimeType } = await this.fileUploadService.saveFile(
      file,
      incidentId
    );

    // Determine file type
    const fileType = this.fileUploadService.getFileMimeTypeCategory(mimeType);

    // Create attachment record in database
    const attachment = this.incidentAttachmentsRepository.create({
      incidentId,
      filename,
      filePath,
      fileType,
      uploadedBy: currentUserId,
    });

    const savedAttachment = await this.incidentAttachmentsRepository.save(attachment);

    // Return the attachment with relations
    const attachmentWithRelations = await this.incidentAttachmentsRepository.findOne({
      where: { id: savedAttachment.id },
      relations: ['uploadedBy2'],
    });

    if (!attachmentWithRelations) {
      throw new Error('Failed to retrieve saved attachment');
    }

    return attachmentWithRelations;
  }
}