import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(DailyAttendanceEntity)
    private readonly attendanceRepository: Repository<DailyAttendanceEntity>,
    @InjectRepository(ChildrenEntity)
    private readonly childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(AuthorizedPickupPersonsEntity)
    private readonly authorizedPickupRepository: Repository<AuthorizedPickupPersonsEntity>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto, createdBy: number): Promise<DailyAttendanceEntity> {
    const { childId, attendanceDate, ...attendanceData } = createAttendanceDto;

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
      createdBy,
    });

    return this.attendanceRepository.save(attendance);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<DailyAttendanceEntity>> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .leftJoinAndSelect('attendance.createdBy2', 'createdBy')
      .orderBy('attendance.attendanceDate', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [attendances, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(attendances, pageMetaDto);
  }

  async findOne(id: number): Promise<DailyAttendanceEntity> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['child', 'deliveredBy2', 'pickedUpBy2', 'createdBy2', 'updatedBy2'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto, updatedBy: number): Promise<DailyAttendanceEntity> {
    await this.findOne(id);
    
    await this.attendanceRepository.update(id, {
      ...updateAttendanceDto,
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
    const { childId, pickedUpBy, checkOutNotes } = checkOutDto;
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
    attendance.checkOutNotes = checkOutNotes;
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

  async findByDateRange(startDate: string, endDate: string, pageOptionsDto: PageOptionsDto): Promise<PageDto<DailyAttendanceEntity>> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('attendance.deliveredBy2', 'deliveredBy')
      .leftJoinAndSelect('attendance.pickedUpBy2', 'pickedUpBy')
      .where('attendance.attendanceDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.attendanceDate', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [attendances, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(attendances, pageMetaDto);
  }

  async findByChild(childId: number, pageOptionsDto: PageOptionsDto): Promise<PageDto<DailyAttendanceEntity>> {
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

  async getTodayAttendance(): Promise<DailyAttendanceEntity[]> {
    const today = new Date().toISOString().split('T')[0];

    return this.attendanceRepository.find({
      where: { attendanceDate: today },
      relations: ['child', 'deliveredBy2', 'pickedUpBy2'],
      order: { checkInTime: 'ASC' },
    });
  }

  async getAttendanceStatus(childId: number, date?: string): Promise<{
    isPresent: boolean;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    attendance?: DailyAttendanceEntity;
  }> {
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