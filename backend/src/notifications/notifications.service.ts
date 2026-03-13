import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    this.logger.log(`Creating notification for user ${createNotificationDto.userId}, type ${createNotificationDto.type}`);
    const notification = await this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        content: createNotificationDto.content,
        metadata: createNotificationDto.metadata,
      },
    });
    this.logger.log(`Notification created for user ${createNotificationDto.userId}`);
    return notification;
  }

  async findUserNotifications(userId: string, limit = 20, skip = 0) {
    this.logger.log(`Fetching notifications for user ${userId}`);
    const result = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });
    this.logger.log(`Fetched ${result.length} notifications for user ${userId}`);
    return result;
  }

  async findUnreadCount(userId: string) {
    this.logger.log(`Fetching unread count for user ${userId}`);
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    this.logger.log(`Mark as read notification ${notificationId} for user ${userId}`);
    const result = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });

    if (result.count === 0) {
      this.logger.warn(`Notification not found for mark as read: ${notificationId}, user ${userId}`);
      throw new NotFoundException('Notification not found');
    }

    this.logger.log(`Notification ${notificationId} marked as read for user ${userId}`);
    return this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
  }

  async markAllAsRead(userId: string) {
    this.logger.log(`Mark all as read for user ${userId}`);
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    this.logger.log(`Marked all notifications as read for user ${userId}`);
    return result;
  }

  async delete(notificationId: string, userId: string) {
    this.logger.log(`Delete notification ${notificationId} for user ${userId}`);
    const result = await this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });

    if (result.count === 0) {
      this.logger.warn(`Notification not found for delete: ${notificationId}, user ${userId}`);
      throw new NotFoundException('Notification not found');
    }

    this.logger.log(`Notification ${notificationId} deleted for user ${userId}`);
  }

  async deleteAllForUser(userId: string) {
    this.logger.log(`Delete all notifications for user ${userId}`);
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });
    this.logger.log(`Deleted all notifications for user ${userId}`);
    return result;
  }
}
