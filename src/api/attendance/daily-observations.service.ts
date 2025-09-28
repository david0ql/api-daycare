import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyObservationsEntity } from 'src/entities/daily_observations.entity';
import { CreateDailyObservationDto } from './dto/create-daily-observation.dto';
import { UpdateDailyObservationDto } from './dto/update-daily-observation.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';

@Injectable()
export class DailyObservationsService {
  constructor(
    @InjectRepository(DailyObservationsEntity)
    private readonly dailyObservationsRepository: Repository<DailyObservationsEntity>,
  ) {}

  async create(createDailyObservationDto: CreateDailyObservationDto, createdBy: number) {
    const observation = this.dailyObservationsRepository.create({
      ...createDailyObservationDto,
      createdBy,
    });

    return await this.dailyObservationsRepository.save(observation);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<DailyObservationsEntity>> {
    const queryBuilder = this.dailyObservationsRepository
      .createQueryBuilder('daily_observations')
      .leftJoinAndSelect('daily_observations.child', 'child')
      .leftJoinAndSelect('daily_observations.attendance', 'attendance')
      .leftJoinAndSelect('daily_observations.createdBy2', 'createdBy2')
      .orderBy('daily_observations.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ totalCount: itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async findByAttendance(attendanceId: number) {
    return await this.dailyObservationsRepository.find({
      where: { attendanceId },
      relations: ['child', 'attendance', 'createdBy2'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByChild(childId: number) {
    return await this.dailyObservationsRepository.find({
      where: { childId },
      relations: ['child', 'attendance', 'createdBy2'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const observation = await this.dailyObservationsRepository.findOne({
      where: { id },
      relations: ['child', 'attendance', 'createdBy2'],
    });

    if (!observation) {
      throw new NotFoundException(`Daily observation with ID ${id} not found`);
    }

    return observation;
  }

  async update(id: number, updateDailyObservationDto: UpdateDailyObservationDto, userId: number) {
    const observation = await this.findOne(id);

    // Check if user has permission to update (only creator or admin)
    if (observation.createdBy !== userId) {
      throw new ForbiddenException('You can only update observations you created');
    }

    await this.dailyObservationsRepository.update(id, updateDailyObservationDto);
    return await this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const observation = await this.findOne(id);

    // Check if user has permission to delete (only creator or admin)
    if (observation.createdBy !== userId) {
      throw new ForbiddenException('You can only delete observations you created');
    }

    await this.dailyObservationsRepository.delete(id);
    return { message: 'Daily observation deleted successfully' };
  }
}
