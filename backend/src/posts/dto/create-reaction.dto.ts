import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateReactionDto
{
    @ApiProperty({ description: 'reaction type like like, love, insightful', default: 'like' })
    @IsString()
    @MinLength(1)
    @MaxLength(30)
    type: string;
}
