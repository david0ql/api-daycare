import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersEntity } from 'src/entities/users.entity';
import { UserRolesEntity } from 'src/entities/user_roles.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(UserRolesEntity)
    private readonly userRolesRepository: Repository<UserRolesEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Find role
    const userRole = await this.userRolesRepository.findOne({
      where: { name: role },
    });

    if (!userRole) {
      throw new ConflictException('Invalid role specified');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      phone,
      roleId: userRole.id,
    });

    const savedUser = await this.usersRepository.save(user);

    // Generate JWT token
    const payload = { 
      sub: savedUser.id, 
      email: savedUser.email, 
      role: userRole.name 
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '365d' });

    // Return user with role
    const userWithRole = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ['role'],
    });

    return {
      accessToken,
      user: {
        id: userWithRole.id,
        email: userWithRole.email,
        firstName: userWithRole.firstName,
        lastName: userWithRole.lastName,
        phone: userWithRole.phone,
        role: userWithRole.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user with role
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersRepository.update(user.id, {
      lastLogin: new Date(),
    });

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role.name 
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '365d' });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async findUserById(id: number): Promise<UsersEntity> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }
}