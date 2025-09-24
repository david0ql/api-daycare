import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChildrenEntity } from 'src/entities/children.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import { SearchDto } from 'src/dto/search.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private readonly childrenRepository: Repository<ChildrenEntity>,
  ) {}

  async create(createChildDto: CreateChildDto): Promise<ChildrenEntity> {
    const child = this.childrenRepository.create(createChildDto);
    return this.childrenRepository.save(child);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<ChildrenEntity>> {
    const queryBuilder = this.childrenRepository
      .createQueryBuilder('child')
      .orderBy('child.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [children, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(children, pageMetaDto);
  }

  async findOne(id: number): Promise<ChildrenEntity> {
    const child = await this.childrenRepository.findOne({
      where: { id },
    });

    if (!child) {
      throw new NotFoundException(`Child with ID ${id} not found`);
    }

    return child;
  }

  async update(id: number, updateChildDto: UpdateChildDto): Promise<ChildrenEntity> {
    await this.findOne(id);
    await this.childrenRepository.update(id, updateChildDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const child = await this.findOne(id);
    await this.childrenRepository.remove(child);
  }

  async searchByWord(searchDto: SearchDto, pageOptionsDto: PageOptionsDto): Promise<PageDto<ChildrenEntity>> {
    const queryBuilder = this.childrenRepository
      .createQueryBuilder('child')
      .orderBy('child.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .where('child.firstName LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('child.lastName LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('child.birthCity LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('child.address LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` });

    const [children, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(children, pageMetaDto);
  }

  async findByAgeRange(minAge: number, maxAge: number, pageOptionsDto: PageOptionsDto): Promise<PageDto<ChildrenEntity>> {
    const currentDate = new Date();
    const minBirthDate = new Date(currentDate.getFullYear() - maxAge, currentDate.getMonth(), currentDate.getDate());
    const maxBirthDate = new Date(currentDate.getFullYear() - minAge, currentDate.getMonth(), currentDate.getDate());

    const queryBuilder = this.childrenRepository
      .createQueryBuilder('child')
      .where('child.birthDate BETWEEN :minBirthDate AND :maxBirthDate', {
        minBirthDate: minBirthDate.toISOString().split('T')[0],
        maxBirthDate: maxBirthDate.toISOString().split('T')[0],
      })
      .orderBy('child.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [children, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(children, pageMetaDto);
  }

  async togglePaymentAlert(id: number): Promise<ChildrenEntity> {
    const child = await this.findOne(id);
    child.hasPaymentAlert = !child.hasPaymentAlert;
    return this.childrenRepository.save(child);
  }

  async toggleActiveStatus(id: number): Promise<ChildrenEntity> {
    const child = await this.findOne(id);
    child.isActive = !child.isActive;
    return this.childrenRepository.save(child);
  }

  async getChildrenWithPaymentAlerts(pageOptionsDto: PageOptionsDto): Promise<PageDto<ChildrenEntity>> {
    const queryBuilder = this.childrenRepository
      .createQueryBuilder('child')
      .where('child.hasPaymentAlert = :hasPaymentAlert', { hasPaymentAlert: true })
      .andWhere('child.isActive = :isActive', { isActive: true })
      .orderBy('child.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [children, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(children, pageMetaDto);
  }

  calculateAge(birthDate: string): { years: number; months: number } {
    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months };
  }
}