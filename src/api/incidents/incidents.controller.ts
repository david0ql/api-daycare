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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { MarkParentNotifiedDto } from './dto/mark-parent-notified.dto';
import { CreateIncidentAttachmentDto } from './dto/create-incident-attachment.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/api/auth/guards/roles.guard';
import { Roles } from 'src/api/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/api/auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';
import { UserRoleEnum } from 'src/enums/user-role.enum';

@ApiTags('Incidents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Create a new incident report' })
  @ApiResponse({
    status: 201,
    description: 'Incident created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Child or incident type not found',
  })
  create(
    @Body() createIncidentDto: CreateIncidentDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.create(createIncidentDto, currentUser.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all incidents (filtered by user role)' })
  @ApiResponse({
    status: 200,
    description: 'Incidents retrieved successfully',
  })
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.findAll(pageOptionsDto, currentUser.id, currentUser.role.name);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all incident types' })
  @ApiResponse({
    status: 200,
    description: 'Incident types retrieved successfully',
  })
  getIncidentTypes() {
    return this.incidentsService.getIncidentTypes();
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Get incidents for a specific child' })
  @ApiResponse({
    status: 200,
    description: 'Child incidents retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied to child information',
  })
  getIncidentsByChild(
    @Param('childId') childId: string,
    @Query() pageOptionsDto: PageOptionsDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.getIncidentsByChild(
      +childId,
      pageOptionsDto,
      currentUser.id,
      currentUser.role.name,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific incident by ID' })
  @ApiResponse({
    status: 200,
    description: 'Incident retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Incident not found',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.findOne(+id, currentUser.id, currentUser.role.name);
  }

  @Patch(':id')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Update an incident (only by reporter)' })
  @ApiResponse({
    status: 200,
    description: 'Incident updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Incident not found or user not authorized',
  })
  update(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.update(+id, updateIncidentDto, currentUser.id);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Delete an incident (only by reporter)' })
  @ApiResponse({
    status: 200,
    description: 'Incident deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Incident not found or user not authorized',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.remove(+id, currentUser.id);
  }

  @Post('mark-parent-notified')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark incident as parent notified' })
  @ApiResponse({
    status: 200,
    description: 'Incident marked as parent notified successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Incident not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Only educators and administrators can mark incidents as parent notified',
  })
  markParentNotified(
    @Body() markParentNotifiedDto: MarkParentNotifiedDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.markParentNotified(markParentNotifiedDto, currentUser.id);
  }

  @Post('attachments')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Add attachment to an incident' })
  @ApiResponse({
    status: 201,
    description: 'Attachment added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Incident not found',
  })
  addAttachment(
    @Body() createIncidentAttachmentDto: CreateIncidentAttachmentDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.addAttachment(createIncidentAttachmentDto, currentUser.id);
  }

  @Delete('attachments/:attachmentId')
  @Roles(UserRoleEnum.ADMINISTRATOR, UserRoleEnum.EDUCATOR)
  @ApiOperation({ summary: 'Remove attachment from an incident' })
  @ApiResponse({
    status: 200,
    description: 'Attachment removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Attachment not found or user not authorized',
  })
  removeAttachment(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.incidentsService.removeAttachment(+attachmentId, currentUser.id);
  }
}