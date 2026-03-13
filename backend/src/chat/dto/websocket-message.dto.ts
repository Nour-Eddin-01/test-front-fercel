import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

/**
 * DTO for WebSocket sendMessage event
 * Uses same validation rules as REST CreateMessageDto
 */
export class WebSocketMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'content cannot be empty' })
  @MaxLength(1000, { message: 'content cannot exceed 1000 characters' })
  content: string;

  @IsString()
  @IsNotEmpty()
  room: string;
}
