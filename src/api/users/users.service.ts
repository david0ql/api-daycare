import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersEntity } from 'src/entities/users.entity';
import { UserRolesEntity } from 'src/entities/user_roles.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';
import { SearchDto } from 'src/dto/search.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(UserRolesEntity)
    private readonly userRolesRepository: Repository<UserRolesEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UsersEntity> {
    const { email, password, roleId, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Verify role exists
    const role = await this.userRolesRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      ...userData,
      email,
      passwordHash: hashedPassword,
      roleId,
    });

    return this.usersRepository.save(user);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<UsersEntity>> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('user.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [users, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(users, pageMetaDto);
  }

  async findOne(id: number): Promise<UsersEntity> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UsersEntity> {
    const user = await this.findOne(id);

    const { password, roleId, ...updateData } = updateUserDto;

    // If password is being updated, hash it
    if (password) {
      const saltRounds = 12;
      updateData['passwordHash'] = await bcrypt.hash(password, saltRounds);
    }

    // If role is being updated, verify it exists
    if (roleId) {
      const role = await this.userRolesRepository.findOne({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    await this.usersRepository.update(id, updateData);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async searchByWord(searchDto: SearchDto, pageOptionsDto: PageOptionsDto): Promise<PageDto<UsersEntity>> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('user.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .where('user.firstName LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('user.lastName LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('user.email LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` })
      .orWhere('user.phone LIKE :searchWord', { searchWord: `%${searchDto.searchWord}%` });

    const [users, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(users, pageMetaDto);
  }

  async findByRole(roleName: string, pageOptionsDto: PageOptionsDto): Promise<PageDto<UsersEntity>> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName })
      .orderBy('user.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const [users, totalCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(users, pageMetaDto);
  }

  async toggleActiveStatus(id: number): Promise<UsersEntity> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return this.usersRepository.save(user);
  }

  /**
   * Get all available user roles
   * @returns Promise<UserRolesEntity[]> - Array of all user roles
   */
  async getRoles(): Promise<UserRolesEntity[]> {
    return this.userRolesRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }
}