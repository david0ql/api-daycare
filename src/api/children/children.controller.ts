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
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ChildResponseDto } from './dto/child-response.dto';
import { CreateChildWithRelationsDto } from './dto/create-child-with-relations.dto';
import { UpdateChildWithRelationsDto } from './dto/update-child-with-relations.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { SearchDto } from 'src/dto/search.dto';
import { ChildrenEntity } from 'src/entities/children.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Children')
@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Create a new child' })
  @ApiResponse({
    status: 201,
    description: 'Child created successfully',
    type: ChildResponseDto,
  })
  async create(@Body() createChildDto: CreateChildDto): Promise<ChildrenEntity> {
    return this.childrenService.create(createChildDto);
  }

  @Post('with-relations')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Create a new child with relationships' })
  @ApiResponse({
    status: 201,
    description: 'Child with relationships created successfully',
    type: ChildResponseDto,
  })
  async createWithRelations(@Body() createChildWithRelationsDto: CreateChildWithRelationsDto): Promise<ChildrenEntity> {
    return this.childrenService.createWithRelations(createChildWithRelationsDto);
  }

  @Get()
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get all children with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Children retrieved successfully',
    type: [ChildResponseDto],
  })
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<ChildrenEntity>> {
    return this.childrenService.findAll(pageOptionsDto);
  }

  @Get('search')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Search children by word' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [ChildResponseDto],
  })
  async searchByWord(
    @Query() pageOptionsDto: PageOptionsDto,
    @Body() searchDto: SearchDto,
  ): Promise<PageDto<ChildrenEntity>> {
    return this.childrenService.searchByWord(searchDto, pageOptionsDto);
  }

  @Get('age-range')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get children by age range' })
  @ApiQuery({ name: 'minAge', description: 'Minimum age', example: 2 })
  @ApiQuery({ name: 'maxAge', description: 'Maximum age', example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Children by age range retrieved successfully',
    type: [ChildResponseDto],
  })
  async findByAgeRange(
    @Query('minAge', ParseIntPipe) minAge: number,
    @Query('maxAge', ParseIntPipe) maxAge: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<ChildrenEntity>> {
    return this.childrenService.findByAgeRange(minAge, maxAge, pageOptionsDto);
  }

  @Get('payment-alerts')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get children with payment alerts' })
  @ApiResponse({
    status: 200,
    description: 'Children with payment alerts retrieved successfully',
    type: [ChildResponseDto],
  })
  async getChildrenWithPaymentAlerts(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<ChildrenEntity>> {
    return this.childrenService.getChildrenWithPaymentAlerts(pageOptionsDto);
  }

  @Get('available-parents')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get available users to assign as parents' })
  @ApiResponse({
    status: 200,
    description: 'Available parents retrieved successfully',
  })
  async getAvailableParents() {
    return this.childrenService.getAvailableParents();
  }

  @Get(':id')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get child by ID' })
  @ApiParam({ name: 'id', description: 'Child ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Child retrieved successfully',
    type: ChildResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ChildrenEntity> {
    return this.childrenService.findOne(id);
  }

  @Get(':id/age')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get child age calculation' })
  @ApiParam({ name: 'id', description: 'Child ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Child age calculated successfully',
    schema: {
      type: 'object',
      properties: {
        years: { type: 'number', example: 4 },
        months: { type: 'number', example: 6 },
      },
    },
  })
  async getChildAge(@Param('id', ParseIntPipe) id: number): Promise<{ years: number; months: number }> {
    const child = await this.childrenService.findOne(id);
    return this.childrenService.calculateAge(child.birthDate);
  }

  @Patch(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Update child' })
  @ApiParam({ name: 'id', description: 'Child ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Child updated successfully',
    type: ChildResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChildDto: UpdateChildDto,
  ): Promise<ChildrenEntity> {
    return this.childrenService.update(id, updateChildDto);
  }

  @Patch(':id/with-relations')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Update child with relationships' })
  @ApiParam({ name: 'id', description: 'Child ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Child with relationships updated successfully',
    type: ChildResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  async updateWithRelations(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChildWithRelationsDto: UpdateChildWithRelationsDto,
  ): Promise<ChildrenEntity> {
    return this.childrenService.updateWithRelations(id, updateChildWithRelationsDto);
  }

  @Patch(':id/toggle-payment-alert')
  @Roles('administrator')
  @ApiOperation({ summary: 'Toggle child payment alert status' })
  @ApiParam({ name: 'id', description: 'Child ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Payment alert status toggled successfully',
    type: ChildResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  async togglePaymentAlert(@Param('id', ParseIntPipe) id: number): Promise<ChildrenEntity> {
    return this.childrenService.togglePaymentAlert(id);
  }

  @Patch(':id/toggle-status')
  @Roles('administrator')
  @ApiOperation({ summary: 'Toggle child active status' })
  @ApiParam({ name: 'id', description: 'Child ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Child status toggled successfully',
    type: ChildResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  async toggleActiveStatus(@Param('id', ParseIntPipe) id: number): Promise<ChildrenEntity> {
    return this.childrenService.toggleActiveStatus(id);
  }

  @Delete(':id')
  @Roles('administrator')
  @ApiOperation({ summary: 'Delete child' })
  @ApiParam({ name: 'id', description: 'Child ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Child deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.childrenService.remove(id);
  }
}