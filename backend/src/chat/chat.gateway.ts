import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WebSocketMessageDto } from './dto/websocket-message.dto';
import { Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as jwt from 'jsonwebtoken';

interface ConnectedUser {
  socketId: string;
  userId: string;
  username: string;
  room: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
  ) { }

  /**
   * Called after the gateway is initialized.
   * Registers the online checker callback with the service so that
   * the service can determine if a user is currently connected to a room.
   */
  afterInit() {
    this.chatService.setOnlineChecker((userId: string, room: string) => {
      return Array.from(this.connectedUsers.values()).some(
        (user) => user.userId === userId && user.room === room,
      );
    });
    this.logger.log('ChatGateway initialized, online checker registered');
  }

  private async authenticateSocket(client: Socket) {
    const authToken = client.handshake.auth?.token as string | undefined;
    const headerToken = client.handshake.headers.authorization;

    const token =
      authToken ||
      (typeof headerToken === 'string' && headerToken.startsWith('Bearer ')
        ? headerToken.substring(7)
        : undefined);

    if (!token) {
      throw new Error('Missing authentication token');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tradehub-secret-key-change-me',
    ) as jwt.JwtPayload;

    if (!decoded?.sub || typeof decoded.sub !== 'string') {
      throw new Error('Invalid token payload');
    }

    return this.authService.validateUser(decoded.sub);
  }

  /**
   * Called when a user connects
   */
  async handleConnection(client: Socket) {
    try {
      const user = await this.authenticateSocket(client);
      (client.data as any).user = user;

      this.logger.log(`User connected: ${client.id} (${user.username})`);
      client.emit('connectionSuccess', {
        message: 'Connected to chat server',
        socketId: client.id,
        userId: user.id,
      });
    } catch (err) {
      void err; // Ignore unused variable
      this.logger.warn(`Unauthorized socket connection: ${client.id}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  /**
   * Called when a user disconnects
   */
  handleDisconnect(client: Socket) {
    const disconnectedUser = this.connectedUsers.get(client.id);
    this.logger.log(`User disconnected: ${client.id}`);

    if (disconnectedUser?.room) {
      this.server.to(disconnectedUser.room).emit('userLeft', {
        userId: disconnectedUser.userId,
        username: disconnectedUser.username,
      });
    }

    this.connectedUsers.delete(client.id);
  }

  /**
   * User joins a chat room
    * Payload: { room: string }
    * User identity is derived from socket JWT authentication.
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { room } = data;
      const userData: any =
        (client.data as any).user || (await this.authenticateSocket(client));
      const userId = userData.id as string;
      const username = userData.username as string;

      // Store user info
      this.connectedUsers.set(client.id, {
        socketId: client.id,
        userId,
        username,
        room,
      });

      // Join Socket.IO room
      await client.join(room);

      // Load recent messages for the room
      const messagesPaginated = await this.chatService.getRoomMessagesWithCursor(
        room,
        50,
      );

      // Send recent messages to the user
      client.emit('previousMessages', {
        messages: messagesPaginated.messages,
        nextCursor: messagesPaginated.nextCursor,
        hasNextPage: messagesPaginated.hasNextPage,
      });

      // Notify others that user joined
      this.server.to(room).emit('userJoined', {
        userId,
        username,
        connectedUsersCount: Array.from(this.connectedUsers.values()).filter(
          (u) => u.room === room,
        ).length,
      });

      this.logger.log(`${username} joined room: ${room}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error joining room: ${errMsg}`);
      client.emit('error', {
        message: 'Failed to join room',
      });
    }
  }

  /**
   * Send a message to a room
   * Payload: { room: string, content: string }
   * Sender identity is derived from socket authentication/session state.
   * If recipient is not connected, a persistent notification is created.
   * WebSocket messages are validated using WebSocketMessageDto.
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() rawData: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Validate message using DTO
      const dto = plainToInstance(WebSocketMessageDto, rawData);
      const validationErrors = await validate(dto);

      if (validationErrors.length > 0) {
        client.emit('error', {
          message: 'Validation failed',
          details: validationErrors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
          })),
        });
        return;
      }

      const { room, content } = dto;
      const connectedUser = this.connectedUsers.get(client.id);

      if (!connectedUser) {
        client.emit('error', {
          message: 'Join a room before sending messages',
        });
        return;
      }

      if (connectedUser.room !== room) {
        client.emit('error', { message: 'Room mismatch for connected user' });
        return;
      }

      // Save message to database
      const savedMessage = await this.chatService.createMessage({
        senderId: connectedUser.userId,
        room,
        content,
      });

      // Broadcast to room
      this.server.to(room).emit('receiveMessage', savedMessage);

      this.logger.log(`Message sent to ${room} by ${connectedUser.userId}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error sending message: ${errMsg}`);
      client.emit('error', {
        message: errMsg,
      });
    }
  }


  /**
   * Load more messages (cursor-based pagination)
   * Payload: { room: string, limit?: number, cursor?: string }
   */
  @SubscribeMessage('loadMoreMessages')
  async handleLoadMoreMessages(
    @MessageBody() data: { room: string; limit?: number; cursor?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { room, limit = 50, cursor } = data;
      const result = await this.chatService.getRoomMessagesWithCursor(
        room,
        limit,
        cursor,
      );
      client.emit('moreMessages', {
        messages: result.messages,
        nextCursor: result.nextCursor,
        hasNextPage: result.hasNextPage,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Error loading messages: ${errMsg}`);
      client.emit('error', { message: 'Failed to load messages' });
    }
  }

  /**
   * User leaves a room
    * Payload: { room: string }
   */
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    const connectedUser = this.connectedUsers.get(client.id);

    if (!connectedUser) {
      client.emit('error', { message: 'User session not found' });
      return;
    }

    await client.leave(room);
    this.connectedUsers.delete(client.id);

    // Notify others
    const connectedCount = Array.from(this.connectedUsers.values()).filter(
      (u) => u.room === room,
    ).length;

    this.server.to(room).emit('userLeft', {
      userId: connectedUser.userId,
      username: connectedUser.username,
      connectedUsersCount: connectedCount,
    });

    this.logger.log(`${connectedUser.username} left room: ${room}`);
  }

  /**
   * Get list of connected users in a room
   */
  @SubscribeMessage('getConnectedUsers')
  handleGetConnectedUsers(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    const users = Array.from(this.connectedUsers.values())
      .filter((u) => u.room === room)
      .map((u) => ({
        userId: u.userId,
        username: u.username,
      }));

    client.emit('connectedUsers', { users, count: users.length });
  }
}
