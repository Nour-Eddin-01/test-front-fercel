import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PerformanceQueryDto
{
    @ApiProperty({ description: 'number of days for performance history', required: false, default: 30 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(365)
    days?: number = 30;
}
