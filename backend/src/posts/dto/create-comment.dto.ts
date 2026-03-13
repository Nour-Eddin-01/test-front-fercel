import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto
{
    @ApiProperty({ description: 'comment content' })
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    content: string;
}
