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
import { MessagingService } from './messaging.service';
import { CreateMessageThreadDto } from './dto/create-message-thread.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MarkMessageReadDto } from './dto/mark-message-read.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/api/auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('threads')
  @ApiOperation({ summary: 'Create a new message thread' })
  @ApiResponse({
    status: 201,
    description: 'Message thread created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Child or recipient not found',
  })
  createThread(
    @Body() createMessageThreadDto: CreateMessageThreadDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.messagingService.createMessageThread(createMessageThreadDto, currentUser.id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a new message to an existing thread' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Thread or recipient not found',
  })
  createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.messagingService.createMessage(createMessageDto, currentUser.id);
  }

  @Get('threads')
  @ApiOperation({ summary: 'Get all message threads for current user' })
  @ApiResponse({
    status: 200,
    description: 'Message threads retrieved successfully',
  })
  findAllThreads(
    @Query() pageOptionsDto: PageOptionsDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.messagingService.findAllThreads(
      pageOptionsDto,
      currentUser.id,
      currentUser.role.name,
    );
  }

  @Get('threads/:id')
  @ApiOperation({ summary: 'Get a specific message thread by ID' })
  @ApiResponse({
    status: 200,
    description: 'Message thread retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Message thread not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You do not have access to this message thread',
  })
  findThreadById(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.messagingService.findThreadById(+id, currentUser.id, currentUser.role.name);
  }

  @Post('messages/mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a specific message as read' })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  markMessageAsRead(
    @Body() markMessageReadDto: MarkMessageReadDto,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.messagingService.markMessageAsRead(markMessageReadDto, currentUser.id);
  }

  @Post('threads/:id/mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all messages in a thread as read' })
  @ApiResponse({
    status: 200,
    description: 'All messages marked as read successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Message thread not found',
  })
  markAllMessagesAsReadInThread(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.messagingService.markAllMessagesAsReadInThread(+id, currentUser.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread messages count for current user' })
  @ApiResponse({
    status: 200,
    description: 'Unread messages count retrieved successfully',
  })
  getUnreadMessagesCount(@CurrentUser() currentUser: UsersEntity) {
    return this.messagingService.getUnreadMessagesCount(currentUser.id);
  }

  @Delete('threads/:id')
  @ApiOperation({ summary: 'Delete a message thread (only by creator)' })
  @ApiResponse({
    status: 200,
    description: 'Message thread deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Message thread not found or user not authorized',
  })
  deleteThread(
    @Param('id') id: string,
    @CurrentUser() currentUser: UsersEntity,
  ) {
    return this.messagingService.deleteThread(+id, currentUser.id);
  }
}