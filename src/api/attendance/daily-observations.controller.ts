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
} from '@nestjs/swagger';
import { DailyObservationsService } from './daily-observations.service';
import { CreateDailyObservationDto } from './dto/create-daily-observation.dto';
import { UpdateDailyObservationDto } from './dto/update-daily-observation.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { DailyObservationsEntity } from 'src/entities/daily_observations.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';

@ApiTags('Daily Observations')
@Controller('attendance/daily-observations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DailyObservationsController {
  constructor(private readonly dailyObservationsService: DailyObservationsService) {}

  @Post()
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Create a new daily observation record' })
  @ApiResponse({
    status: 201,
    description: 'Daily observation created successfully',
  })
  create(
    @Body() createDailyObservationDto: CreateDailyObservationDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.dailyObservationsService.create(createDailyObservationDto, currentUser.id);
  }

  @Get('all')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get all daily observations with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Daily observations retrieved successfully',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('order') order?: string,
    @CurrentUser() currentUser?: UsersEntity,
  ): Promise<PageDto<DailyObservationsEntity>> {
    // Create PageOptionsDto manually with proper defaults
    const pageOptionsDto: PageOptionsDto = {
      page: page ? parseInt(page, 10) : 1,
      take: take ? parseInt(take, 10) : 10,
      order: (order === 'DESC' ? 'DESC' : 'ASC') as any,
      get skip(): number {
        return ((this.page || 1) - 1) * (this.take || 10);
      }
    };
    
    return this.dailyObservationsService.findAll(
      pageOptionsDto,
      currentUser?.id,
      currentUser?.role.name,
    );
  }

  @Get('attendance/:attendanceId')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get daily observations for a specific attendance record' })
  @ApiParam({ name: 'attendanceId', description: 'Attendance ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily observations for attendance retrieved successfully',
  })
  findByAttendance(@Param('attendanceId', ParseIntPipe) attendanceId: number) {
    return this.dailyObservationsService.findByAttendance(attendanceId);
  }

  @Get('child/:childId')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get daily observations for a specific child' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily observations for child retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not have access to this child',
  })
  findByChild(
    @Param('childId', ParseIntPipe) childId: number,
    @CurrentUser() currentUser?: UsersEntity,
  ) {
    return this.dailyObservationsService.findByChild(
      childId,
      currentUser?.id,
      currentUser?.role.name,
    );
  }

  @Get(':id')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get a specific daily observation by ID' })
  @ApiParam({ name: 'id', description: 'Daily observation ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily observation retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not have access to this observation',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser?: UsersEntity,
  ) {
    return this.dailyObservationsService.findOne(
      id,
      currentUser?.id,
      currentUser?.role.name,
    );
  }

  @Patch(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Update a daily observation record' })
  @ApiParam({ name: 'id', description: 'Daily observation ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily observation updated successfully',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDailyObservationDto: UpdateDailyObservationDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.dailyObservationsService.update(id, updateDailyObservationDto, currentUser.id);
  }

  @Delete(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Delete a daily observation record' })
  @ApiParam({ name: 'id', description: 'Daily observation ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily observation deleted successfully',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.dailyObservationsService.remove(id, currentUser.id);
  }
}
