import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * GET /chat/rooms/:room
   * Get messages from a room with cursor-based pagination
   */
  @Get('rooms/:room')
  async getRoomMessages(
    @Param('room') room: string,
    @Query('limit') limit: string = '50',
    @Query('cursor') cursor?: string,
    @Query('skip') skip?: string,
  ) {
    try {
      // Support both cursor-based and offset-based pagination
      if (cursor || !skip) {
        // Use cursor-based pagination (preferred)
        const result = await this.chatService.getRoomMessagesWithCursor(
          room,
          parseInt(limit),
          cursor,
        );
        return result;
      } else {
        // Fall back to offset-based pagination for backward compatibility
        const messages = await this.chatService.getRoomMessages(
          room,
          parseInt(limit),
          parseInt(skip),
        );
        const totalCount = await this.chatService.getRoomMessageCount(room);
        return { messages, totalCount };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * POST /chat/messages
   * Create a new message
   */
  @Post('messages')
  async createMessage(
    @Request() req,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    try {
      const userId = req.user.id;
      const message = await this.chatService.createMessage({
        senderId: userId,
        room: createMessageDto.room,
        content: createMessageDto.content,
      });
      return message;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * DELETE /chat/messages/:id
   * Delete a message
   */
  @Delete('messages/:id')
  async deleteMessage(
    @Request() req,
    @Param('id') messageId: string,
  ) {
    try {
      const userId = req.user.id;
      await this.chatService.deleteMessage(messageId, userId);
      return { message: 'Message deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * GET /chat/dm-rooms
   * Get user's direct message rooms
   */
  @Get('dm-rooms')
  async getUserDMRooms(@Request() req) {
    try {
      const userId = req.user.id;
      const rooms = await this.chatService.getUserDMRooms(userId);
      return { rooms };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
