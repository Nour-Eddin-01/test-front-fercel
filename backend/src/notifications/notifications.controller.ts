import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Get user's notifications with pagination
   */
  @Get()
  async getNotifications(
    @Request() req,
    @Query('limit') limit: string = '20',
    @Query('skip') skip: string = '0',
  ) {
    const userId = req.user.id;
    const notifications = await this.notificationsService.findUserNotifications(
      userId,
      parseInt(limit),
      parseInt(skip),
    );
    return { notifications };
  }

  /**
   * GET /notifications/unread-count
   * Get count of unread notifications
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const count = await this.notificationsService.findUnreadCount(userId);
    return { unreadCount: count };
  }

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read
   */
  @Patch(':id/read')
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    const userId = req.user.id;
    const notification = await this.notificationsService.markAsRead(
      notificationId,
      userId,
    );
    return { message: 'Notification marked as read', notification };
  }

  /**
   * PATCH /notifications/read-all
   * Mark all notifications as read
   */
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  /**
   * DELETE /notifications/:id
   * Delete a notification
   */
  @Delete(':id')
  async deleteNotification(@Request() req, @Param('id') notificationId: string) {
    const userId = req.user.id;
    await this.notificationsService.delete(notificationId, userId);
    return { message: 'Notification deleted' };
  }

  /**
   * DELETE /notifications
   * Delete all notifications for the user
   */
  @Delete()
  async deleteAllNotifications(@Request() req) {
    const userId = req.user.id;
    await this.notificationsService.deleteAllForUser(userId);
    return { message: 'All notifications deleted' };
  }
}
