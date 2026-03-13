import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class SellStockDto
{
	@ApiProperty({ description: 'stock id (cuid)' })
	@IsString()
	@MinLength(1)
	stockId: string;

	@ApiProperty({ description: 'quantity to sell' })
	@IsInt()
	@Min(1)
	quantity: number;
}
