import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto
{
  @ApiProperty({ description: 'new user email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'new user username' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: 'new user password' })
  @IsString()
  @MinLength(8)
  password: string;
}
