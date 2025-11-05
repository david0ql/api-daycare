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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActivityPhotosService } from './activity-photos.service';
import { CreateActivityPhotoDto } from './dto/create-activity-photo.dto';
import { UpdateActivityPhotoDto } from './dto/update-activity-photo.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { ActivityPhotosEntity } from 'src/entities/activity_photos.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';

@ApiTags('Activity Photos')
@Controller('attendance/activity-photos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActivityPhotosController {
  constructor(private readonly activityPhotosService: ActivityPhotosService) {}

  @Post()
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Create a new activity photo record' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Activity photo created successfully',
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createActivityPhotoDto: CreateActivityPhotoDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    
    return this.activityPhotosService.create(createActivityPhotoDto, file, currentUser.id);
  }

  @Get('all')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get all activity photos with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Activity photos retrieved successfully',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('order') order?: string,
    @CurrentUser() currentUser?: UsersEntity,
  ): Promise<PageDto<ActivityPhotosEntity>> {
    // Create PageOptionsDto manually with proper defaults
    const pageOptionsDto: PageOptionsDto = {
      page: page ? parseInt(page, 10) : 1,
      take: take ? parseInt(take, 10) : 10,
      order: (order === 'DESC' ? 'DESC' : 'ASC') as any,
      get skip(): number {
        return ((this.page || 1) - 1) * (this.take || 10);
      }
    };
    
    return this.activityPhotosService.findAll(
      pageOptionsDto,
      currentUser?.id,
      currentUser?.role.name,
    );
  }

  @Get('attendance/:attendanceId')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get activity photos for a specific attendance record' })
  @ApiParam({ name: 'attendanceId', description: 'Attendance ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity photos for attendance retrieved successfully',
  })
  findByAttendance(@Param('attendanceId', ParseIntPipe) attendanceId: number) {
    return this.activityPhotosService.findByAttendance(attendanceId);
  }

  @Get('child/:childId')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get activity photos for a specific child' })
  @ApiParam({ name: 'childId', description: 'Child ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity photos for child retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not have access to this child',
  })
  findByChild(
    @Param('childId', ParseIntPipe) childId: number,
    @CurrentUser() currentUser?: UsersEntity,
  ) {
    return this.activityPhotosService.findByChild(
      childId,
      currentUser?.id,
      currentUser?.role.name,
    );
  }

  @Get(':id')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get a specific activity photo by ID' })
  @ApiParam({ name: 'id', description: 'Activity photo ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity photo retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not have access to this photo',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser?: UsersEntity,
  ) {
    return this.activityPhotosService.findOne(
      id,
      currentUser?.id,
      currentUser?.role.name,
    );
  }

  @Patch(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Update an activity photo record' })
  @ApiParam({ name: 'id', description: 'Activity photo ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity photo updated successfully',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivityPhotoDto: UpdateActivityPhotoDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.activityPhotosService.update(id, updateActivityPhotoDto, currentUser.id);
  }

  @Delete(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Delete an activity photo record' })
  @ApiParam({ name: 'id', description: 'Activity photo ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity photo deleted successfully',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.activityPhotosService.remove(id, currentUser.id);
  }
}
