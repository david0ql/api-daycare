import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CalendarFilterDto } from './dto/calendar-filter.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/api/auth/guards/roles.guard';
import { Roles } from 'src/api/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/api/auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';
import { UserRoleEnum } from 'src/enums/user-role.enum';

@ApiTags('Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiResponse({
    status: 201,
    description: 'Calendar event created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date or time format',
  })
  createEvent(
    @Body() createCalendarEventDto: CreateCalendarEventDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.calendarService.create(createCalendarEventDto, currentUser.id);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get calendar events with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Calendar events retrieved successfully',
  })
  findAllEvents(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() filterDto: CalendarFilterDto,
  ) {
    return this.calendarService.findAll(pageOptionsDto, filterDto);
  }

  @Get('events/range')
  @ApiOperation({ summary: 'Get events within a date range' })
  @ApiResponse({
    status: 200,
    description: 'Events in date range retrieved successfully',
  })
  getEventsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.getEventsByDateRange(startDate, endDate);
  }

  @Get('events/month/:year/:month')
  @ApiOperation({ summary: 'Get events for a specific month' })
  @ApiResponse({
    status: 200,
    description: 'Monthly events retrieved successfully',
  })
  getEventsByMonth(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.calendarService.getEventsByMonth(+year, +month);
  }

  @Get('events/upcoming')
  @ApiOperation({ summary: 'Get upcoming events (default 30 days)' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming events retrieved successfully',
  })
  getUpcomingEvents(
    @Query('days') days: string = '30',
  ) {
    return this.calendarService.getUpcomingEvents(+days);
  }

  @Get('events/current')
  @ApiOperation({ summary: 'Get current events (happening today)' })
  @ApiResponse({
    status: 200,
    description: 'Current events retrieved successfully',
  })
  getCurrentEvents() {
    return this.calendarService.getCurrentEvents();
  }

  @Get('event-types')
  @ApiOperation({ summary: 'Get all available event types' })
  @ApiResponse({
    status: 200,
    description: 'Event types retrieved successfully',
  })
  getEventTypes() {
    return this.calendarService.getEventTypes();
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get a specific calendar event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Calendar event retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Calendar event not found',
  })
  findOneEvent(@Param('id') id: string) {
    return this.calendarService.findOne(+id);
  }

  @Patch('events/:id')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Update a calendar event (only by creator)' })
  @ApiResponse({
    status: 200,
    description: 'Calendar event updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Calendar event not found or user not authorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date or time format',
  })
  updateEvent(
    @Param('id') id: string,
    @Body() updateCalendarEventDto: UpdateCalendarEventDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.calendarService.update(+id, updateCalendarEventDto, currentUser.id);
  }

  @Delete('events/:id')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Delete a calendar event (only by creator)' })
  @ApiResponse({
    status: 200,
    description: 'Calendar event deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Calendar event not found or user not authorized',
  })
  removeEvent(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.calendarService.remove(+id, currentUser.id);
  }
}