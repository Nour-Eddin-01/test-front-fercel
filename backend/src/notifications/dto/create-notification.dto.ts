import { IsNotEmpty, IsString, MaxLength, MinLength, IsUUID, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT',
  TRADE_EXECUTED = 'TRADE_EXECUTED',
  BADGE_EARNED = 'BADGE_EARNED',
  LEVEL_UP = 'LEVEL_UP',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  NEW_MESSAGE = 'NEW_MESSAGE',
}

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(NotificationType, {
    message: `type must be one of: ${Object.values(NotificationType).join(', ')}`,
  })
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'content cannot be empty' })
  @MaxLength(500, { message: 'content cannot exceed 500 characters' })
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
