import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyAttendanceEntity } from 'src/entities/daily_attendance.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { AuthorizedPickupPersonsEntity } from 'src/entities/authorized_pickup_persons.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import { SearchDto } from 'src/dto/search.dto';
import { ParentFilterService } from '../shared/services/parent-filter.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(DailyAttendanceEntity)
    private readonly attendanceRepository: Repository<DailyAttendanceEntity>,
    @InjectRepository(ChildrenEntity)
    private readonly childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(AuthorizedPickupPersonsEntity)
    private readonly authorizedPickupRepository: Repository<AuthorizedPickupPersonsEntity>,
    private readonly parentFilterService: ParentFilterService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto, createdBy: number): Promise<DailyAttendanceEntity> {
    const { childId, attendanceDate, notes, ...attendanceData } = createAttendanceDto;

    // Check if child exists
    const child = await this.childrenRepository.findOne({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException(`Child with ID ${childId} not found`);
    }

    // Check if attendance already exists for this child and date
    const existingAttendance = await this.attendanceRepository.findOne({
      where: { childId, attendanceDate },
    });

    if (existingAttendance) {
      throw new ConflictException('Attendance already exists for this child on this date');
    }

    // Verify authorized persons if provided
    if (attendanceData.deliveredBy) {
      const deliveredBy = await this.authorizedPickupRepository.findOne({
        where: { id: attendanceData.deliveredBy },
        relations: ['child'],
      });

      if (!deliveredBy || deliveredBy.childId !== childId) {
        throw new BadRequestException('Invalid authorized person for delivery');
      }
    }

    if (attendanceData.pickedUpBy) {
      const pickedUpBy = await this.authorizedPickupRepository.findOne({
        where: { id: attendanceData.pickedUpBy },
        relations: ['child'],
      });

      if (!pickedUpBy || pickedUpBy.childId !== childId) {
        throw new BadRequestException('Invalid authorized person for pickup');
      }
    }

    const attendance = this.attendanceRepository.create({
      ...attendanceData,
      childId,
      attendanceDate,
      checkOutNotes: notes,
      createdBy,
    });

    return this.attendanceRepository.save(attendance);
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<PageDto<DailyAttendanceEntity>> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .leftJoinAndSelect('attendance.createdBy2', 'createdBy')
      .orderBy('attendance.attendanceDate', pageOptionsDto.order);

    // If user is parent, only show attendance for their children
    if (currentUserRole === 'parent' && currentUserId) {
      const childIds = await this.parentFilterService.getParentChildIds(currentUserId);
      if (childIds.length === 0) {
        return new PageDto([], new PageMetaDto({ totalCount: 0, pageOptionsDto }));
      }
      queryBuilder.andWhere('attendance.childId IN (:...childIds)', { childIds });
    }

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const [attendances, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(attendances, pageMetaDto);
  }

  async findOne(
    id: number,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<DailyAttendanceEntity> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['child', 'deliveredBy2', 'pickedUpBy2', 'createdBy2', 'updatedBy2'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    // If user is parent, verify they have access to this child's attendance
    if (currentUserRole === 'parent' && currentUserId) {
      const hasAccess = await this.parentFilterService.hasAccessToChild(currentUserId, attendance.childId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this attendance record');
      }
    }

    console.log('🔍 Backend - Attendance findOne - attendance:', attendance);
    console.log('🔍 Backend - Attendance findOne - checkInNotes:', attendance.checkInNotes);
    console.log('🔍 Backend - Attendance findOne - checkOutNotes:', attendance.checkOutNotes);

    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto, updatedBy: number): Promise<DailyAttendanceEntity> {
    await this.findOne(id);
    
    const { notes, ...restDto } = updateAttendanceDto;
    
    await this.attendanceRepository.update(id, {
      ...restDto,
      checkOutNotes: notes, // Map notes to checkOutNotes
      updatedBy,
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async checkIn(checkInDto: CheckInDto, createdBy: number): Promise<DailyAttendanceEntity> {
    const { childId, deliveredBy, checkInNotes } = checkInDto;
    const attendanceDate = new Date().toISOString().split('T')[0];

    // Check if attendance already exists for today
    const existingAttendance = await this.attendanceRepository.findOne({
      where: { childId, attendanceDate },
    });

    if (existingAttendance) {
      if (existingAttendance.checkInTime) {
        throw new ConflictException('Child already checked in today');
      }
      
      // Update existing attendance with check-in
      existingAttendance.checkInTime = new Date();
      existingAttendance.deliveredBy = deliveredBy || null;
      existingAttendance.checkInNotes = checkInNotes || null;
      existingAttendance.updatedBy = createdBy;

      return this.attendanceRepository.save(existingAttendance);
    }

    // Create new attendance record
    return this.create({
      childId,
      attendanceDate,
      checkInTime: new Date().toISOString(),
      deliveredBy,
      checkInNotes,
    }, createdBy);
  }

  async checkOut(checkOutDto: CheckOutDto, updatedBy: number): Promise<DailyAttendanceEntity> {
    const { childId, pickedUpBy, notes } = checkOutDto;
    const attendanceDate = new Date().toISOString().split('T')[0];

    // Find today's attendance
    const attendance = await this.attendanceRepository.findOne({
      where: { childId, attendanceDate },
    });

    if (!attendance) {
      throw new NotFoundException('No attendance record found for today');
    }

    if (!attendance.checkInTime) {
      throw new BadRequestException('Child must be checked in before check-out');
    }

    if (attendance.checkOutTime) {
      throw new ConflictException('Child already checked out today');
    }

    // Verify authorized person
    const authorizedPerson = await this.authorizedPickupRepository.findOne({
      where: { id: pickedUpBy },
      relations: ['child'],
    });

    if (!authorizedPerson || authorizedPerson.childId !== childId) {
      throw new BadRequestException('Invalid authorized person for pickup');
    }

    // Update attendance with check-out
    attendance.checkOutTime = new Date();
    attendance.pickedUpBy = pickedUpBy;
    attendance.checkOutNotes = notes;
    attendance.updatedBy = updatedBy;

    return this.attendanceRepository.save(attendance);
  }

  async searchByWord(searchDto: SearchDto, pageOptionsDto: PageOptionsDto): Promise<PageDto<DailyAttendanceEntity>> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .orderBy('attendance.attendanceDate', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .where('child.firstName LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('child.lastName LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('attendance.checkInNotes LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('attendance.checkOutNotes LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` });

    const [attendances, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(attendances, pageMetaDto);
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
    pageOptionsDto: PageOptionsDto,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<PageDto<DailyAttendanceEntity>> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .where('attendance.attendanceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.attendanceDate', pageOptionsDto.order);

    // If user is parent, only show attendance for their children
    if (currentUserRole === 'parent' && currentUserId) {
      const childIds = await this.parentFilterService.getParentChildIds(currentUserId);
      if (childIds.length === 0) {
        return new PageDto([], new PageMetaDto({ totalCount: 0, pageOptionsDto }));
      }
      queryBuilder.andWhere('attendance.childId IN (:...childIds)', { childIds });
    }

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const [attendances, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(attendances, pageMetaDto);
  }

  async findByChild(
    childId: number,
    pageOptionsDto: PageOptionsDto,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<PageDto<DailyAttendanceEntity>> {
    // If user is parent, verify they have access to this child
    if (currentUserRole === 'parent' && currentUserId) {
      const hasAccess = await this.parentFilterService.hasAccessToChild(currentUserId, childId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this child');
      }
    }

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .where('attendance.childId = :childId', { childId })
      .orderBy('attendance.attendanceDate', 'DESC')
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [attendances, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(attendances, pageMetaDto);
  }

  async getTodayAttendance(
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<DailyAttendanceEntity[]> {
    const today = new Date().toISOString().split('T')[0];

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .where('attendance.attendanceDate = :today', { today })
      .orderBy('attendance.checkInTime', 'ASC');

    // If user is parent, only show attendance for their children
    if (currentUserRole === 'parent' && currentUserId) {
      const childIds = await this.parentFilterService.getParentChildIds(currentUserId);
      if (childIds.length === 0) {
        return [];
      }
      queryBuilder.andWhere('attendance.childId IN (:...childIds)', { childIds });
    }

    return queryBuilder.getMany();
  }

  async getAttendanceStatus(
    childId: number,
    date?: string,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<{
    isPresent: boolean;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    attendance?: DailyAttendanceEntity;
  }> {
    // If user is parent, verify they have access to this child
    if (currentUserRole === 'parent' && currentUserId) {
      const hasAccess = await this.parentFilterService.hasAccessToChild(currentUserId, childId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this child');
      }
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    const attendance = await this.attendanceRepository.findOne({
      where: { childId, attendanceDate },
    });

    if (!attendance) {
      return {
        isPresent: false,
        isCheckedIn: false,
        isCheckedOut: false,
      };
    }

    return {
      isPresent: true,
      isCheckedIn: !!attendance.checkInTime,
      isCheckedOut: !!attendance.checkOutTime,
      attendance,
    };
  }
}