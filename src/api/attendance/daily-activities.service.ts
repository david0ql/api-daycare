import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyActivitiesEntity } from 'src/entities/daily_activities.entity';
import { CreateDailyActivityDto, ActivityTypeEnum } from './dto/create-daily-activity.dto';
import { UpdateDailyActivityDto } from './dto/update-daily-activity.dto';
import { CreateBulkDailyActivitiesDto } from './dto/create-bulk-daily-activities.dto';
import { UpdateBulkDailyActivitiesDto } from './dto/update-bulk-daily-activities.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import { ParentFilterService } from '../shared/services/parent-filter.service';

@Injectable()
export class DailyActivitiesService {
  constructor(
    @InjectRepository(DailyActivitiesEntity)
    private readonly dailyActivitiesRepository: Repository<DailyActivitiesEntity>,
    private readonly parentFilterService: ParentFilterService,
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

  async createBulk(
    dto: CreateBulkDailyActivitiesDto,
    createdBy: number,
  ): Promise<DailyActivitiesEntity[]> {
    const { childId, attendanceId, activities } = dto;
    const REPEATABLE_TYPES: string[] = [
      ActivityTypeEnum.DIAPER_CHANGE,
      ActivityTypeEnum.HYDRATION,
    ];

    // Fetch existing activities for this attendance to detect conflicts
    const existing = await this.dailyActivitiesRepository.find({
      where: { childId, attendanceId },
      select: ['activityType'],
    });
    const existingTypes = existing.map((a) => a.activityType);

    // Filter out non-repeatable types that already exist
    const toCreate = activities.filter(
      (item) =>
        REPEATABLE_TYPES.includes(item.activityType) ||
        !existingTypes.includes(item.activityType as any),
    );

    if (toCreate.length === 0) {
      return [];
    }

    const entities = toCreate.map((item) =>
      this.dailyActivitiesRepository.create({
        childId,
        attendanceId,
        activityType: item.activityType,
        completed: item.completed ?? 0,
        timeCompleted: item.timeCompleted,
        notes: item.notes,
        createdBy,
      }),
    );

    return await this.dailyActivitiesRepository.save(entities);
  }

  async updateBulk(
    dto: UpdateBulkDailyActivitiesDto,
    userId: number,
    userRole: string,
  ): Promise<DailyActivitiesEntity[]> {
    const results: DailyActivitiesEntity[] = [];

    for (const item of dto.updates) {
      const { id, ...updateData } = item;
      const activity = await this.dailyActivitiesRepository.findOne({ where: { id } });
      if (!activity) continue;

      if (activity.createdBy !== userId && userRole !== 'administrator') {
        throw new ForbiddenException('You can only update activities you created');
      }

      await this.dailyActivitiesRepository.update(id, updateData);
      const updated = await this.dailyActivitiesRepository.findOne({
        where: { id },
        relations: ['child', 'attendance', 'createdBy2'],
      });
      if (updated) results.push(updated);
    }

    return results;
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<PageDto<DailyActivitiesEntity>> {
    const queryBuilder = this.dailyActivitiesRepository
      .createQueryBuilder('daily_activities')
      .leftJoinAndSelect('daily_activities.child', 'child')
      .leftJoinAndSelect('daily_activities.attendance', 'attendance')
      .leftJoinAndSelect('daily_activities.createdBy2', 'createdBy2')
      .orderBy('attendance.attendanceDate', 'DESC')
      .addOrderBy('child.firstName', 'ASC')
      .addOrderBy('child.lastName', 'ASC');

    // If user is parent, only show activities for their children
    if (currentUserRole === 'parent' && currentUserId) {
      const childIds = await this.parentFilterService.getParentChildIds(currentUserId);
      if (childIds.length === 0) {
        return new PageDto([], new PageMetaDto({ totalCount: 0, pageOptionsDto }));
      }
      queryBuilder.andWhere('daily_activities.childId IN (:...childIds)', { childIds });
    }

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

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

  async findByChild(
    childId: number,
    currentUserId?: number,
    currentUserRole?: string,
  ) {
    // If user is parent, verify they have access to this child
    if (currentUserRole === 'parent' && currentUserId) {
      const hasAccess = await this.parentFilterService.hasAccessToChild(currentUserId, childId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this child');
      }
    }

    return await this.dailyActivitiesRepository.find({
      where: { childId },
      relations: ['child', 'attendance', 'createdBy2'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    id: number,
    currentUserId?: number,
    currentUserRole?: string,
  ) {
    const activity = await this.dailyActivitiesRepository.findOne({
      where: { id },
      relations: ['child', 'attendance', 'createdBy2'],
    });

    if (!activity) {
      throw new NotFoundException(`Daily activity with ID ${id} not found`);
    }

    // If user is parent, verify they have access to this child
    if (currentUserRole === 'parent' && currentUserId) {
      const hasAccess = await this.parentFilterService.hasAccessToChild(currentUserId, activity.childId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this activity');
      }
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
