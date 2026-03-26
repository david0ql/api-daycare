import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/api/auth/decorators/current-user.decorator';
import { UsersEntity } from 'src/entities/users.entity';
import { NotificationLogService } from './notification-log.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationLogController {
  constructor(private readonly notificationLogService: NotificationLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getMyNotifications(
    @CurrentUser() user: UsersEntity,
    @Query('page') page?: string,
    @Query('take') take?: string,
  ) {
    return this.notificationLogService.findByParent(
      user.id,
      page ? parseInt(page) : 1,
      take ? parseInt(take) : 20,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: UsersEntity) {
    const count = await this.notificationLogService.getUnreadCount(user.id);
    return { count };
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    await this.notificationLogService.markRead(id, user.id);
    return { message: 'Notification marked as read' };
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: UsersEntity) {
    await this.notificationLogService.markAllRead(user.id);
    return { message: 'All notifications marked as read' };
  }
}
