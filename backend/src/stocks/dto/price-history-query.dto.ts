import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class PriceHistoryQueryDto
{
    @ApiProperty({ description: 'max number of history entries', required: false, default: 30 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 30;

    @ApiProperty({ description: 'filter from date (ISO 8601)', required: false })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiProperty({ description: 'filter to date (ISO 8601)', required: false })
    @IsOptional()
    @IsDateString()
    to?: string;
}
