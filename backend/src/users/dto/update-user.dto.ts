import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto 
{
  @ApiProperty({ description: 'user new bio' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  bio?: string;

  @ApiProperty({ description: 'user new avatarUrl (profile picture)' }, )
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
