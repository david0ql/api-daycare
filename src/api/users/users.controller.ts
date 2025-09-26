import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { SearchDto } from 'src/dto/search.dto';
import { UsersEntity } from 'src/entities/users.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user-roles')
  @ApiOperation({
    summary: 'Get all user roles',
    description: 'Retrieve all available user roles in the system. Only administrators can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all available user roles',
    type: [RoleResponseDto],
  })
  async getRoles(): Promise<RoleResponseDto[]> {
    return this.usersService.getRoles();
  }

  @Post()
  @Roles('administrator')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UsersEntity> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
  })
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<UsersEntity>> {
    return this.usersService.findAll(pageOptionsDto);
  }

  @Get('search')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Search users by word' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [UserResponseDto],
  })
  async searchByWord(
    @Query() pageOptionsDto: PageOptionsDto,
    @Body() searchDto: SearchDto,
  ): Promise<PageDto<UsersEntity>> {
    return this.usersService.searchByWord(searchDto, pageOptionsDto);
  }

  @Get('role/:roleName')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({
    name: 'roleName',
    description: 'Role name (parent, educator, administrator)',
    example: 'parent',
  })
  @ApiResponse({
    status: 200,
    description: 'Users by role retrieved successfully',
    type: [UserResponseDto],
  })
  async findByRole(
    @Param('roleName') roleName: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<UsersEntity>> {
    return this.usersService.findByRole(roleName, pageOptionsDto);
  }

  @Get(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UsersEntity> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrator')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UsersEntity> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/toggle-status')
  @Roles('administrator')
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'User status toggled successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async toggleActiveStatus(@Param('id', ParseIntPipe) id: number): Promise<UsersEntity> {
    return this.usersService.toggleActiveStatus(id);
  }

  @Delete(':id')
  @Roles('administrator')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@CurrentUser() user: UsersEntity): Promise<UsersEntity> {
    return user;
  }

  @Patch('profile/me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: UsersEntity,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UsersEntity> {
    // Remove roleId and other restricted fields for self-update
    const { roleId, isActive, ...allowedUpdates } = updateUserDto;
    return this.usersService.update(user.id, allowedUpdates);
  }

}