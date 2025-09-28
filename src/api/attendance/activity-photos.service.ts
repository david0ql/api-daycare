import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityPhotosEntity } from 'src/entities/activity_photos.entity';
import { CreateActivityPhotoDto } from './dto/create-activity-photo.dto';
import { UpdateActivityPhotoDto } from './dto/update-activity-photo.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import { FileUploadService } from './services/file-upload.service';

@Injectable()
export class ActivityPhotosService {
  constructor(
    @InjectRepository(ActivityPhotosEntity)
    private readonly activityPhotosRepository: Repository<ActivityPhotosEntity>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(
    createActivityPhotoDto: CreateActivityPhotoDto, 
    file: Express.Multer.File, 
    uploadedBy: number
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const { filename, filePath } = await this.fileUploadService.saveFile(
      file, 
      'activity-photos',
      'activity'
    );

    const photo = this.activityPhotosRepository.create({
      ...createActivityPhotoDto,
      filename,
      filePath,
      uploadedBy,
    });

    return await this.activityPhotosRepository.save(photo);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<ActivityPhotosEntity>> {
    const queryBuilder = this.activityPhotosRepository
      .createQueryBuilder('activity_photos')
      .leftJoinAndSelect('activity_photos.child', 'child')
      .leftJoinAndSelect('activity_photos.attendance', 'attendance')
      .leftJoinAndSelect('activity_photos.uploadedBy2', 'uploadedBy2')
      .orderBy('activity_photos.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ totalCount: itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async findByAttendance(attendanceId: number) {
    return await this.activityPhotosRepository.find({
      where: { attendanceId },
      relations: ['child', 'attendance', 'uploadedBy2'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByChild(childId: number) {
    return await this.activityPhotosRepository.find({
      where: { childId },
      relations: ['child', 'attendance', 'uploadedBy2'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const photo = await this.activityPhotosRepository.findOne({
      where: { id },
      relations: ['child', 'attendance', 'uploadedBy2'],
    });

    if (!photo) {
      throw new NotFoundException(`Activity photo with ID ${id} not found`);
    }

    return photo;
  }

  async update(id: number, updateActivityPhotoDto: UpdateActivityPhotoDto, userId: number) {
    const photo = await this.findOne(id);

    // Check if user has permission to update (only uploader or admin)
    if (photo.uploadedBy !== userId) {
      throw new ForbiddenException('You can only update photos you uploaded');
    }

    await this.activityPhotosRepository.update(id, updateActivityPhotoDto);
    return await this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const photo = await this.findOne(id);

    // Check if user has permission to delete (only uploader or admin)
    if (photo.uploadedBy !== userId) {
      throw new ForbiddenException('You can only delete photos you uploaded');
    }

    // Delete file from filesystem
    try {
      await this.fileUploadService.deleteFile(photo.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await this.activityPhotosRepository.delete(id);
    return { message: 'Activity photo deleted successfully' };
  }
}
