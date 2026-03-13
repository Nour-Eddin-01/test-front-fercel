import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto
{
  @ApiProperty({ description: 'user email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'user password' })
  @IsString()
  @MinLength(8)
  password: string;
}
