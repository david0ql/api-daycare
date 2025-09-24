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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageDto } from 'src/dto/page.dto';
import { SearchDto } from 'src/dto/search.dto';
import { DailyAttendanceEntity } from 'src/entities/daily_attendance.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Create attendance record' })
  @ApiResponse({
    status: 201,
    description: 'Attendance created successfully',
  })
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<DailyAttendanceEntity> {
    return this.attendanceService.create(createAttendanceDto, user.id);
  }

  @Post('check-in')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Check in a child' })
  @ApiResponse({
    status: 201,
    description: 'Child checked in successfully',
  })
  async checkIn(
    @Body() checkInDto: CheckInDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<DailyAttendanceEntity> {
    return this.attendanceService.checkIn(checkInDto, user.id);
  }

  @Post('check-out')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Check out a child' })
  @ApiResponse({
    status: 200,
    description: 'Child checked out successfully',
  })
  async checkOut(
    @Body() checkOutDto: CheckOutDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<DailyAttendanceEntity> {
    return this.attendanceService.checkOut(checkOutDto, user.id);
  }

  @Get()
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get all attendance records with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Attendance records retrieved successfully',
  })
  async findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<DailyAttendanceEntity>> {
    return this.attendanceService.findAll(pageOptionsDto);
  }

  @Get('today')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get today\'s attendance records' })
  @ApiResponse({
    status: 200,
    description: 'Today\'s attendance records retrieved successfully',
  })
  async getTodayAttendance(): Promise<DailyAttendanceEntity[]> {
    return this.attendanceService.getTodayAttendance();
  }

  @Get('search')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Search attendance records by word' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchByWord(
    @Query() pageOptionsDto: PageOptionsDto,
    @Body() searchDto: SearchDto,
  ): Promise<PageDto<DailyAttendanceEntity>> {
    return this.attendanceService.searchByWord(searchDto, pageOptionsDto);
  }

  @Get('date-range')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Get attendance records by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({
    status: 200,
    description: 'Attendance records by date range retrieved successfully',
  })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<DailyAttendanceEntity>> {
    return this.attendanceService.findByDateRange(startDate, endDate, pageOptionsDto);
  }

  @Get('child/:childId')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get attendance records for a specific child' })
  @ApiParam({ name: 'childId', description: 'Child ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Child attendance records retrieved successfully',
  })
  async findByChild(
    @Param('childId', ParseIntPipe) childId: number,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<DailyAttendanceEntity>> {
    return this.attendanceService.findByChild(childId, pageOptionsDto);
  }

  @Get('status/:childId')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get attendance status for a child' })
  @ApiParam({ name: 'childId', description: 'Child ID', example: 1 })
  @ApiQuery({ name: 'date', description: 'Date (YYYY-MM-DD)', example: '2024-01-15', required: false })
  @ApiResponse({
    status: 200,
    description: 'Attendance status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        isPresent: { type: 'boolean', example: true },
        isCheckedIn: { type: 'boolean', example: true },
        isCheckedOut: { type: 'boolean', example: false },
        attendance: { $ref: '#/components/schemas/DailyAttendanceEntity' },
      },
    },
  })
  async getAttendanceStatus(
    @Param('childId', ParseIntPipe) childId: number,
    @Query('date') date?: string,
  ): Promise<{
    isPresent: boolean;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    attendance?: DailyAttendanceEntity;
  }> {
    return this.attendanceService.getAttendanceStatus(childId, date);
  }

  @Get(':id')
  @Roles('administrator', 'educator', 'parent')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiParam({ name: 'id', description: 'Attendance ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Attendance record retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attendance record not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DailyAttendanceEntity> {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @Roles('administrator', 'educator')
  @ApiOperation({ summary: 'Update attendance record' })
  @ApiParam({ name: 'id', description: 'Attendance ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Attendance record updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attendance record not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CurrentUser() user: UsersEntity,
  ): Promise<DailyAttendanceEntity> {
    return this.attendanceService.update(id, updateAttendanceDto, user.id);
  }

  @Delete(':id')
  @Roles('administrator')
  @ApiOperation({ summary: 'Delete attendance record' })
  @ApiParam({ name: 'id', description: 'Attendance ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Attendance record deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attendance record not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.attendanceService.remove(id);
  }
}