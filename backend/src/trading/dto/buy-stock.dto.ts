import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class BuyStockDto
{
	@ApiProperty({ description: 'stock id (cuid)' })
	@IsString()
	@MinLength(1)
	stockId: string;

	@ApiProperty({ description: 'quantity to buy' })
	@IsInt()
	@Min(1)
	quantity: number;
}
