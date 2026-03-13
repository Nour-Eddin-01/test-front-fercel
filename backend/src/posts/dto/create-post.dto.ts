import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto
{
    @ApiProperty({ description: 'post text', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    text?: string;

    @ApiProperty({ description: 'image url', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    imageUrl?: string;

    @ApiProperty({ description: 'link url', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    linkUrl?: string;

    @ApiProperty({ description: 'related stock id (cuid)', required: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    stockId?: string;

    @ApiProperty({ description: 'post visibility', required: false, default: 'public', enum: ['public', 'followers'] })
    @IsOptional()
    @IsString()
    @IsIn(['public', 'followers'])
    visibility?: string = 'public';
}
