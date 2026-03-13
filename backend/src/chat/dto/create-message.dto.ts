import { IsNotEmpty, IsString, MaxLength, MinLength, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'content cannot be empty' })
  @MaxLength(1000, { message: 'content cannot exceed 1000 characters' })
  content: string;

  @IsString()
  @IsNotEmpty()
  room: string;
}
