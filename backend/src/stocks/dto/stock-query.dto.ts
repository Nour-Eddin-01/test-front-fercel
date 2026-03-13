import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class StockQueryDto
{
    @ApiProperty({ description: 'page number', required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ description: 'items per page', required: false, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({ description: 'filter by sector', required: false })
    @IsOptional()
    @IsString()
    sector?: string;

    @ApiProperty({ description: 'search by name or ISIN', required: false })
    @IsOptional()
    @IsString()
    search?: string;
}