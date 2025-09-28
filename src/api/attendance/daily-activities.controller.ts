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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DailyActivitiesService } from './daily-activities.service';
import { CreateDailyActivityDto } from './dto/create-daily-activity.dto';
import { UpdateDailyActivityDto } from './dto/update-daily-activity.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { DailyActivitiesEntity } from 'src/entities/daily_activities.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';

@ApiTags('Daily Activities')
@Controller('attendance/daily-activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DailyActivitiesController {
  constructor(private readonly dailyActivitiesService: DailyActivitiesService) {}

  @Post()
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Create a new daily activity record' })
  @ApiResponse({
    status: 201,
    description: 'Daily activity created successfully',
  })
  create(
    @Body() createDailyActivityDto: CreateDailyActivityDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.dailyActivitiesService.create(createDailyActivityDto, currentUser.id);
  }

  @Get('all')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get all daily activities with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Daily activities retrieved successfully',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('order') order?: string
  ): Promise<PageDto<DailyActivitiesEntity>> {
    // Create PageOptionsDto manually with proper defaults
    const pageOptionsDto: PageOptionsDto = {
      page: page ? parseInt(page, 10) : 1,
      take: take ? parseInt(take, 10) : 10,
      order: (order === 'DESC' ? 'DESC' : 'ASC') as any,
      get skip(): number {
        return ((this.page || 1) - 1) * (this.take || 10);
      }
    };
    
    return this.dailyActivitiesService.findAll(pageOptionsDto);
  }


  @Get('attendance/:attendanceId')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get daily activities for a specific attendance record' })
  @ApiParam({ name: 'attendanceId', description: 'Attendance ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily activities for attendance retrieved successfully',
  })
  findByAttendance(@Param('attendanceId', ParseIntPipe) attendanceId: number) {
    return this.dailyActivitiesService.findByAttendance(attendanceId);
  }

  @Get('child/:childId')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get daily activities for a specific child' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily activities for child retrieved successfully',
  })
  findByChild(@Param('childId', ParseIntPipe) childId: number) {
    return this.dailyActivitiesService.findByChild(childId);
  }

  @Get(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get a specific daily activity by ID' })
  @ApiParam({ name: 'id', description: 'Daily activity ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily activity retrieved successfully',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dailyActivitiesService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Update a daily activity record' })
  @ApiParam({ name: 'id', description: 'Daily activity ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily activity updated successfully',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDailyActivityDto: UpdateDailyActivityDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.dailyActivitiesService.update(id, updateDailyActivityDto, currentUser.id);
  }

  @Delete(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Delete a daily activity record' })
  @ApiParam({ name: 'id', description: 'Daily activity ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily activity deleted successfully',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.dailyActivitiesService.remove(id, currentUser.id);
  }
}
