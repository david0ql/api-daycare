import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CalendarFilterDto } from './dto/calendar-filter.dto';
import { CalendarEventsEntity } from 'src/entities/calendar_events.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { PageDto } from 'src/dto/page.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import moment from 'moment';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEventsEntity)
    private readonly calendarEventsRepository: Repository<CalendarEventsEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async create(
    createCalendarEventDto: CreateCalendarEventDto,
    currentUserId: number,
  ): Promise<CalendarEventsEntity> {
    const { title, description, eventType, startDate, endDate, isAllDay, startTime, endTime } = createCalendarEventDto;

    // Validate date range
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    if (endMoment.isBefore(startMoment)) {
      throw new BadRequestException('End date cannot be before start date');
    }

    // Validate time fields
    if (!isAllDay) {
      if (!startTime || !endTime) {
        throw new BadRequestException('Start time and end time are required when event is not all day');
      }

      // Validate time format
      if (!moment(startTime, 'HH:mm', true).isValid()) {
        throw new BadRequestException('Invalid start time format. Use HH:mm format');
      }

      if (!moment(endTime, 'HH:mm', true).isValid()) {
        throw new BadRequestException('Invalid end time format. Use HH:mm format');
      }

      // Validate time range
      const startTimeMoment = moment(startTime, 'HH:mm');
      const endTimeMoment = moment(endTime, 'HH:mm');

      if (startMoment.isSame(endMoment, 'day') && endTimeMoment.isBefore(startTimeMoment)) {
        throw new BadRequestException('End time cannot be before start time on the same day');
      }
    }

    const event = this.calendarEventsRepository.create({
      title,
      description: description || null,
      eventType,
      startDate,
      endDate,
      isAllDay: isAllDay ?? true,
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      createdBy: currentUserId,
    });

    return this.calendarEventsRepository.save(event);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    filterDto: CalendarFilterDto,
  ): Promise<PageDto<CalendarEventsEntity>> {
    const queryBuilder = this.calendarEventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.createdBy2', 'createdBy')
      .orderBy('event.startDate', 'ASC')
      .addOrderBy('event.startTime', 'ASC');

    // Apply filters
    if (filterDto.startDate) {
      queryBuilder.andWhere('event.startDate >= :startDate', { startDate: filterDto.startDate });
    }

    if (filterDto.endDate) {
      queryBuilder.andWhere('event.endDate <= :endDate', { endDate: filterDto.endDate });
    }

    if (filterDto.eventType) {
      queryBuilder.andWhere('event.eventType = :eventType', { eventType: filterDto.eventType });
    }

    if (filterDto.currentOnly) {
      const today = moment().format('YYYY-MM-DD');
      queryBuilder.andWhere('event.startDate <= :today AND event.endDate >= :today', { today });
    }

    if (filterDto.upcomingOnly) {
      const today = moment().format('YYYY-MM-DD');
      queryBuilder.andWhere('event.startDate >= :today', { today });
    }

    const total = await queryBuilder.getCount();
    const events = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();

    // Add temporal information to each event
    const eventsWithTemporalInfo = events.map(event => ({
      ...event,
      isCurrent: this.isEventCurrent(event),
      isPast: this.isEventPast(event),
      isFuture: this.isEventFuture(event),
    }));

    const pageMeta = new PageMetaDto({ pageOptionsDto, totalCount: total });

    return new PageDto(eventsWithTemporalInfo, pageMeta);
  }

  async findOne(id: number): Promise<CalendarEventsEntity> {
    const event = await this.calendarEventsRepository.findOne({
      where: { id },
      relations: ['createdBy2'],
    });

    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    // Add temporal information
    return {
      ...event,
      isCurrent: this.isEventCurrent(event),
      isPast: this.isEventPast(event),
      isFuture: this.isEventFuture(event),
    } as any;
  }

  async update(
    id: number,
    updateCalendarEventDto: UpdateCalendarEventDto,
    currentUserId: number,
  ): Promise<CalendarEventsEntity> {
    const event = await this.calendarEventsRepository.findOne({
      where: { id, createdBy: currentUserId },
    });

    if (!event) {
      throw new NotFoundException('Calendar event not found or you are not the creator');
    }

    // Validate date range if provided
    if (updateCalendarEventDto.startDate || updateCalendarEventDto.endDate) {
      const startDate = updateCalendarEventDto.startDate || event.startDate;
      const endDate = updateCalendarEventDto.endDate || event.endDate;

      const startMoment = moment(startDate);
      const endMoment = moment(endDate);

      if (endMoment.isBefore(startMoment)) {
        throw new BadRequestException('End date cannot be before start date');
      }
    }

    // Validate time fields if provided
    const isAllDay = updateCalendarEventDto.isAllDay ?? event.isAllDay;
    if (!isAllDay) {
      const startTime = updateCalendarEventDto.startTime || event.startTime;
      const endTime = updateCalendarEventDto.endTime || event.endTime;

      if (!startTime || !endTime) {
        throw new BadRequestException('Start time and end time are required when event is not all day');
      }

      // Validate time format
      if (!moment(startTime, 'HH:mm', true).isValid()) {
        throw new BadRequestException('Invalid start time format. Use HH:mm format');
      }

      if (!moment(endTime, 'HH:mm', true).isValid()) {
        throw new BadRequestException('Invalid end time format. Use HH:mm format');
      }

      // Validate time range
      const startDate = updateCalendarEventDto.startDate || event.startDate;
      const endDate = updateCalendarEventDto.endDate || event.endDate;
      const startMoment = moment(startDate);
      const endMoment = moment(endDate);

      if (startMoment.isSame(endMoment, 'day')) {
        const startTimeMoment = moment(startTime, 'HH:mm');
        const endTimeMoment = moment(endTime, 'HH:mm');

        if (endTimeMoment.isBefore(startTimeMoment)) {
          throw new BadRequestException('End time cannot be before start time on the same day');
        }
      }
    }

    const updateData = {
      ...updateCalendarEventDto,
      updatedAt: new Date(),
    };

    await this.calendarEventsRepository.update(id, updateData);

    return this.findOne(id);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const event = await this.calendarEventsRepository.findOne({
      where: { id, createdBy: currentUserId },
    });

    if (!event) {
      throw new NotFoundException('Calendar event not found or you are not the creator');
    }

    await this.calendarEventsRepository.remove(event);
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEventsEntity[]> {
    const events = await this.calendarEventsRepository.find({
      where: {
        startDate: Between(startDate, endDate),
      },
      relations: ['createdBy2'],
      order: {
        startDate: 'ASC',
        startTime: 'ASC',
      },
    });

    // Add temporal information to each event
    return events.map(event => ({
      ...event,
      isCurrent: this.isEventCurrent(event),
      isPast: this.isEventPast(event),
      isFuture: this.isEventFuture(event),
    })) as any;
  }

  async getEventsByMonth(year: number, month: number): Promise<CalendarEventsEntity[]> {
    const startOfMonth = moment([year, month - 1]).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment([year, month - 1]).endOf('month').format('YYYY-MM-DD');

    return this.getEventsByDateRange(startOfMonth, endOfMonth);
  }

  async getUpcomingEvents(days: number = 30): Promise<CalendarEventsEntity[]> {
    const startDate = moment().format('YYYY-MM-DD');
    const endDate = moment().add(days, 'days').format('YYYY-MM-DD');

    return this.getEventsByDateRange(startDate, endDate);
  }

  async getCurrentEvents(): Promise<CalendarEventsEntity[]> {
    const today = moment().format('YYYY-MM-DD');

    const events = await this.calendarEventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.createdBy2', 'createdBy')
      .where('event.startDate <= :today AND event.endDate >= :today', { today })
      .orderBy('event.startTime', 'ASC')
      .getMany();

    // Add temporal information to each event
    return events.map(event => ({
      ...event,
      isCurrent: true,
      isPast: false,
      isFuture: false,
    })) as any;
  }

  async getEventTypes(): Promise<string[]> {
    const result = await this.calendarEventsRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.eventType', 'eventType')
      .orderBy('event.eventType', 'ASC')
      .getRawMany();

    return result.map(item => item.eventType);
  }

  private isEventCurrent(event: CalendarEventsEntity): boolean {
    const today = moment();
    const startDate = moment(event.startDate);
    const endDate = moment(event.endDate);

    return today.isSameOrAfter(startDate, 'day') && today.isSameOrBefore(endDate, 'day');
  }

  private isEventPast(event: CalendarEventsEntity): boolean {
    const today = moment();
    const endDate = moment(event.endDate);

    return today.isAfter(endDate, 'day');
  }

  private isEventFuture(event: CalendarEventsEntity): boolean {
    const today = moment();
    const startDate = moment(event.startDate);

    return today.isBefore(startDate, 'day');
  }
}