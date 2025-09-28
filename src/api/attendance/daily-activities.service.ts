import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyActivitiesEntity } from 'src/entities/daily_activities.entity';
import { CreateDailyActivityDto } from './dto/create-daily-activity.dto';
import { UpdateDailyActivityDto } from './dto/update-daily-activity.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';

@Injectable()
export class DailyActivitiesService {
  constructor(
    @InjectRepository(DailyActivitiesEntity)
    private readonly dailyActivitiesRepository: Repository<DailyActivitiesEntity>,
  ) {}

  async create(createDailyActivityDto: CreateDailyActivityDto, createdBy: number) {
    const { childId, attendanceId, activityType } = createDailyActivityDto;

    // Check if activity type already exists for this child and attendance
    const existingActivity = await this.dailyActivitiesRepository.findOne({
      where: {
        childId,
        attendanceId,
        activityType,
      },
    });

    if (existingActivity) {
      throw new ConflictException(
        `Activity type '${activityType}' already exists for this child and attendance record`
      );
    }

    const activity = this.dailyActivitiesRepository.create({
      ...createDailyActivityDto,
      createdBy,
    });

    return await this.dailyActivitiesRepository.save(activity);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<DailyActivitiesEntity>> {
    const queryBuilder = this.dailyActivitiesRepository
      .createQueryBuilder('daily_activities')
      .leftJoinAndSelect('daily_activities.child', 'child')
      .leftJoinAndSelect('daily_activities.attendance', 'attendance')
      .leftJoinAndSelect('daily_activities.createdBy2', 'createdBy2')
      .orderBy('daily_activities.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ totalCount: itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async findByAttendance(attendanceId: number) {
    return await this.dailyActivitiesRepository.find({
      where: { attendanceId },
      relations: ['child', 'attendance', 'createdBy2'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByChild(childId: number) {
    return await this.dailyActivitiesRepository.find({
      where: { childId },
      relations: ['child', 'attendance', 'createdBy2'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const activity = await this.dailyActivitiesRepository.findOne({
      where: { id },
      relations: ['child', 'attendance', 'createdBy2'],
    });

    if (!activity) {
      throw new NotFoundException(`Daily activity with ID ${id} not found`);
    }

    return activity;
  }

  async update(id: number, updateDailyActivityDto: UpdateDailyActivityDto, userId: number) {
    const activity = await this.findOne(id);

    // Check if user has permission to update (only creator or admin)
    if (activity.createdBy !== userId) {
      throw new ForbiddenException('You can only update activities you created');
    }

    await this.dailyActivitiesRepository.update(id, updateDailyActivityDto);
    return await this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const activity = await this.findOne(id);

    // Check if user has permission to delete (only creator or admin)
    if (activity.createdBy !== userId) {
      throw new ForbiddenException('You can only delete activities you created');
    }

    await this.dailyActivitiesRepository.delete(id);
    return { message: 'Daily activity deleted successfully' };
  }
}
