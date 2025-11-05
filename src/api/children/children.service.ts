import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChildrenEntity } from 'src/entities/children.entity';
import { ParentChildRelationshipsEntity } from 'src/entities/parent_child_relationships.entity';
import { EmergencyContactsEntity } from 'src/entities/emergency_contacts.entity';
import { AuthorizedPickupPersonsEntity } from 'src/entities/authorized_pickup_persons.entity';
import { MedicalInformationEntity } from 'src/entities/medical_information.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { CreateChildWithRelationsDto } from './dto/create-child-with-relations.dto';
import { UpdateChildWithRelationsDto } from './dto/update-child-with-relations.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import { SearchDto } from 'src/dto/search.dto';
import { ParentFilterService } from '../shared/services/parent-filter.service';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(ChildrenEntity)
    private readonly childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(ParentChildRelationshipsEntity)
    private readonly parentChildRelationshipsRepository: Repository<ParentChildRelationshipsEntity>,
    @InjectRepository(EmergencyContactsEntity)
    private readonly emergencyContactsRepository: Repository<EmergencyContactsEntity>,
    @InjectRepository(AuthorizedPickupPersonsEntity)
    private readonly authorizedPickupPersonsRepository: Repository<AuthorizedPickupPersonsEntity>,
    @InjectRepository(MedicalInformationEntity)
    private readonly medicalInformationRepository: Repository<MedicalInformationEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly parentFilterService: ParentFilterService,
  ) {}

  async create(createChildDto: CreateChildDto): Promise<ChildrenEntity> {
    const child = this.childrenRepository.create(createChildDto);
    return this.childrenRepository.save(child);
  }

  async createWithRelations(createChildWithRelationsDto: CreateChildWithRelationsDto): Promise<ChildrenEntity> {
    // Create the child first
    const { parentRelationships, emergencyContacts, authorizedPickupPersons, medicalInformation, ...childData } = createChildWithRelationsDto;
    
    const child = this.childrenRepository.create(childData);
    const savedChild = await this.childrenRepository.save(child);

    // Create parent-child relationships
    if (parentRelationships && parentRelationships.length > 0) {
      for (const relationship of parentRelationships) {
        const parentChildRelationship = this.parentChildRelationshipsRepository.create({
          ...relationship,
          childId: savedChild.id,
        });
        await this.parentChildRelationshipsRepository.save(parentChildRelationship);
      }
    }

    // Create emergency contacts
    if (emergencyContacts && emergencyContacts.length > 0) {
      for (const contact of emergencyContacts) {
        const emergencyContact = this.emergencyContactsRepository.create({
          ...contact,
          childId: savedChild.id,
        });
        await this.emergencyContactsRepository.save(emergencyContact);
      }
    }

    // Create authorized pickup persons
    if (authorizedPickupPersons && authorizedPickupPersons.length > 0) {
      for (const person of authorizedPickupPersons) {
        const authorizedPerson = this.authorizedPickupPersonsRepository.create({
          ...person,
          childId: savedChild.id,
        });
        await this.authorizedPickupPersonsRepository.save(authorizedPerson);
      }
    }

    // Create medical information
    if (medicalInformation) {
      const medicalInfo = this.medicalInformationRepository.create({
        ...medicalInformation,
        childId: savedChild.id,
      });
      await this.medicalInformationRepository.save(medicalInfo);
    }

    return savedChild;
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<PageDto<ChildrenEntity>> {
    const queryBuilder = this.childrenRepository
      .createQueryBuilder('child')
      .orderBy('child.createdAt', pageOptionsDto.order);

    // If user is parent, only show their children
    if (currentUserRole === 'parent' && currentUserId) {
      const childIds = await this.parentFilterService.getParentChildIds(currentUserId);
      if (childIds.length === 0) {
        // Parent has no children, return empty result
        return new PageDto([], new PageMetaDto({ totalCount: 0, pageOptionsDto }));
      }
      queryBuilder.where('child.id IN (:...childIds)', { childIds });
    }

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const [children, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(children, pageMetaDto);
  }

  async findOne(
    id: number,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<ChildrenEntity> {
    const child = await this.childrenRepository.findOne({
      where: { id },
      relations: [
        'parentChildRelationships',
        'parentChildRelationships.parent',
        'emergencyContacts',
        'authorizedPickupPersons',
        'medicalInformation'
      ],
    });

    if (!child) {
      throw new NotFoundException(`Child with ID ${id} not found`);
    }

    // If user is parent, verify they have access to this child
    if (currentUserRole === 'parent' && currentUserId) {
      const hasAccess = await this.parentFilterService.hasAccessToChild(currentUserId, id);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this child');
      }
    }

    return child;
  }

  async update(id: number, updateChildDto: UpdateChildDto): Promise<ChildrenEntity> {
    await this.findOne(id);
    await this.childrenRepository.update(id, updateChildDto);
    return this.findOne(id);
  }

  async updateWithRelations(id: number, updateChildWithRelationsDto: UpdateChildWithRelationsDto): Promise<ChildrenEntity> {
    const { parentRelationships, emergencyContacts, authorizedPickupPersons, medicalInformation, ...childData } = updateChildWithRelationsDto;
    
    // Update child basic data
    await this.findOne(id);
    await this.childrenRepository.update(id, childData);

    // Update parent-child relationships
    if (parentRelationships && parentRelationships.length > 0) {
      // Delete existing relationships
      await this.parentChildRelationshipsRepository.delete({ childId: id });
      
      // Create new relationships
      for (const relationship of parentRelationships) {
        const parentChildRelationship = this.parentChildRelationshipsRepository.create({
          ...relationship,
          childId: id,
        });
        await this.parentChildRelationshipsRepository.save(parentChildRelationship);
      }
    }

    // Update emergency contacts
    if (emergencyContacts && emergencyContacts.length > 0) {
      // Delete existing emergency contacts
      await this.emergencyContactsRepository.delete({ childId: id });
      
      // Create new emergency contacts
      for (const contact of emergencyContacts) {
        const emergencyContact = this.emergencyContactsRepository.create({
          ...contact,
          childId: id,
        });
        await this.emergencyContactsRepository.save(emergencyContact);
      }
    }

    // Update authorized pickup persons
    if (authorizedPickupPersons && authorizedPickupPersons.length > 0) {
      // Delete existing authorized pickup persons
      await this.authorizedPickupPersonsRepository.delete({ childId: id });
      
      // Create new authorized pickup persons
      for (const person of authorizedPickupPersons) {
        const authorizedPickupPerson = this.authorizedPickupPersonsRepository.create({
          ...person,
          childId: id,
        });
        await this.authorizedPickupPersonsRepository.save(authorizedPickupPerson);
      }
    }

    // Update medical information
    if (medicalInformation && medicalInformation.length > 0) {
      // Delete existing medical information
      await this.medicalInformationRepository.delete({ childId: id });
      
      // Create new medical information
      for (const medical of medicalInformation) {
        const medicalInfo = this.medicalInformationRepository.create({
          ...medical,
          childId: id,
        });
        await this.medicalInformationRepository.save(medicalInfo);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const child = await this.findOne(id);
    await this.childrenRepository.remove(child);
  }

  async searchByWord(
    searchDto: SearchDto,
    pageOptionsDto: PageOptionsDto,
    currentUserId?: number,
    currentUserRole?: string,
  ): Promise<PageDto<ChildrenEntity>> {
    const queryBuilder = this.childrenRepository
      .createQueryBuilder('child')
      .orderBy('child.createdAt', pageOptionsDto.order)
      .where('child.firstName LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('child.lastName LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('child.birthCity LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('child.address LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` });

    // If user is parent, only search within their children
    if (currentUserRole === 'parent' && currentUserId) {
      const childIds = await this.parentFilterService.getParentChildIds(currentUserId);
      if (childIds.length === 0) {
        // Parent has no children, return empty result
        return new PageDto([], new PageMetaDto({ totalCount: 0, pageOptionsDto }));
      }
      queryBuilder.andWhere('child.id IN (:...childIds)', { childIds });
    }

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

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

  async getAvailableParents() {
    // Get users with parent role
    const parents = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .where('role.name = :roleName', { roleName: 'parent' })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.phone'
      ])
      .getMany();

    return parents.map(parent => ({
      id: parent.id,
      name: `${parent.firstName} ${parent.lastName}`,
      email: parent.email,
      phone: parent.phone,
    }));
  }

}