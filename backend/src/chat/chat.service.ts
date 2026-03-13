import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';

export interface CreateChatMessageInput {
  senderId: string;
  room: string;
  content: string;
}

export interface ChatMessageResponse {
  id: string;
  senderId: string;
  senderName?: string;
  room: string;
  content: string;
  createdAt: Date;
}

export interface PaginatedChatMessages {
  messages: ChatMessageResponse[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

/**
 * Type for the online-status checker callback.
 * The gateway registers this so the service can check if a user is connected to a room.
 * If no checker is registered (REST context), recipients default to offline.
 */
export type OnlineChecker = (userId: string, room: string) => boolean;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private onlineChecker: OnlineChecker | null = null;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) { }

  /**
   * Register a callback to check if a user is currently connected to a room.
   * Called by ChatGateway during initialization.
   */
  setOnlineChecker(checker: OnlineChecker) {
    this.onlineChecker = checker;
  }

  private parseDMRoom(room: string): [string, string] | null {
    if (!room.startsWith('dm:')) {
      return null;
    }

    const parts = room.split(':');
    if (parts.length !== 3 || !parts[1] || !parts[2]) {
      throw new Error('Invalid direct message room format');
    }

    return [parts[1], parts[2]];
  }

  private async validateDMRoomForSender(room: string, senderId: string) {
    const participants = this.parseDMRoom(room);
    if (!participants) {
      return;
    }

    const [userA, userB] = participants;

    if (senderId !== userA && senderId !== userB) {
      throw new Error('You are not a participant in this direct message room');
    }

    const recipientId = senderId === userA ? userB : userA;
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    });

    if (!recipient) {
      throw new Error('Recipient user does not exist');
    }
  }

  /**
   * Create a new chat message
   */
  async createMessage(input: CreateChatMessageInput) {
    this.logger.log(`Create message for sender ${input.senderId}, room ${input.room}`);
    await this.validateDMRoomForSender(input.room, input.senderId);

    const message = await this.prisma.chatMessage.create({
      data: {
        senderId: input.senderId,
        room: input.room,
        content: input.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const result = {
      id: message.id,
      senderId: message.senderId,
      senderName: message.sender?.username,
      senderAvatar: message.sender?.avatarUrl,
      room: message.room,
      content: message.content,
      createdAt: message.createdAt,
    };

    // Notify offline recipient (works for both REST and WebSocket callers)
    await this.notifyOfflineRecipient(input.room, input.senderId, result);

    this.logger.log(`Message created successfully, sender ${input.senderId}`);
    return result;
  }

  /**
   * Create a notification for the DM recipient if they are not currently
   * connected to the room. If no onlineChecker is registered (REST context),
   * the recipient is assumed offline.
   */
  private async notifyOfflineRecipient(
    room: string,
    senderId: string,
    message: { id: string; senderName?: string; content: string },
  ) {
    const participants = this.parseDMRoom(room);
    if (!participants) {
      return; // Not a DM room, skip
    }

    const [userA, userB] = participants;
    const recipientId = senderId === userA ? userB : userA;

    // If an online checker is registered (WebSocket context), use it.
    // Otherwise (REST context), assume the recipient is offline.
    if (this.onlineChecker && this.onlineChecker(recipientId, room)) {
      return; // Recipient is online in this room, no notification needed
    }

    try {
      await this.notificationsService.create({
        userId: recipientId,
        type: NotificationType.NEW_MESSAGE,
        content: `New message from ${message.senderName || 'Unknown'}`,
        metadata: {
          senderId,
          senderName: message.senderName,
          room,
          messageId: message.id,
          messagePreview: message.content.substring(0, 50),
        },
      });
      this.logger.log(
        `Notification created for ${recipientId} (offline)`,
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Failed to create notification for offline recipient: ${errMsg}`,
      );
    }
  }

  /**
   * Get chat messages for a room with pagination
   */
  async getRoomMessages(
    room: string,
    limit = 50,
    skip = 0,
  ): Promise<ChatMessageResponse[]> {
    this.logger.log(`Fetching messages for room ${room}`);
    const messages = await this.prisma.chatMessage.findMany({
      where: { room },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Reverse to get chronological order (oldest first)
    return messages.reverse().map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.sender?.username,
      senderAvatar: msg.sender?.avatarUrl,
      room: msg.room,
      content: msg.content,
      createdAt: msg.createdAt,
    }));
  }

  /**
   * Get chat messages with cursor-based pagination
   * @param room - The chat room identifier
   * @param limit - Maximum number of messages to return (default: 50)
   * @param cursor - Message ID to start pagination from (exclusive)
   * @returns Messages with pagination info and next cursor
   */
  async getRoomMessagesWithCursor(
    room: string,
    limit = 50,
    cursor?: string,
  ): Promise<PaginatedChatMessages> {
    this.logger.log(`Fetching messages for room ${room}, cursor ${cursor ?? 'none'}`);
    // Fetch one extra to determine if there are more messages
    const fetchLimit = limit + 1;

    const messages = await this.prisma.chatMessage.findMany({
      where: { room },
      orderBy: [
        { createdAt: 'desc' },  // Primary sort by timestamp
        { id: 'desc' },         // Secondary sort by ID for stable pagination with duplicate timestamps
      ],
      take: fetchLimit,
      ...(cursor && {
        skip: 1, // Skip the cursor itself
        cursor: { id: cursor },
      }),
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Check if there are more messages
    const hasNextPage = messages.length > limit;
    const paginatedMessages = hasNextPage ? messages.slice(0, limit) : messages;

    // Reverse to get chronological order (oldest first)
    const formattedMessages = paginatedMessages.reverse().map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.sender?.username,
      senderAvatar: msg.sender?.avatarUrl,
      room: msg.room,
      content: msg.content,
      createdAt: msg.createdAt,
    }));

    // Next cursor is the last message ID (for fetching older messages)
    const nextCursor =
      hasNextPage && paginatedMessages.length > 0
        ? paginatedMessages[paginatedMessages.length - 1].id
        : null;

    return {
      messages: formattedMessages,
      nextCursor,
      hasNextPage,
    };
  }

  /**
   * Get user's direct message rooms
   */
  async getUserDMRooms(userId: string) {
    this.logger.log(`Fetching DM rooms for user ${userId}`);
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        room: {
          startsWith: `dm:`,
        },
        OR: [
          { room: { contains: `${userId}` } },
          { senderId: userId },
        ],
      },
      distinct: ['room'],
      select: { room: true },
    });

    return messages.map((m) => m.room);
  }

  /**
   * Delete a message (only by sender or admin)
   */
  async deleteMessage(messageId: string, userId: string) {
    this.logger.log(`Delete message ${messageId} by user ${userId}`);
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      this.logger.warn(`Message not found for delete: ${messageId}`);
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      this.logger.warn(`Unauthorized delete message ${messageId} by user ${userId}`);
      throw new Error('Unauthorized');
    }

    const deleted = await this.prisma.chatMessage.delete({
      where: { id: messageId },
    });
    this.logger.log(`Message ${messageId} deleted successfully by user ${userId}`);
    return deleted;
  }

  /**
   * Get total message count for a room
   */
  async getRoomMessageCount(room: string) {
    return this.prisma.chatMessage.count({
      where: { room },
    });
  }
}
