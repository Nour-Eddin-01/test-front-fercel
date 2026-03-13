import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BuyStockDto } from './dto/buy-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { TradingService } from './trading.service';

@ApiTags('trading')
@Controller('trading')
export class TradingController
{
	constructor(private tradingService: TradingService) {}

	@Post('buy')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Buy stock for current user' })
	@ApiResponse({ status: 201, description: 'Buy order executed' })
	@ApiResponse({ status: 400, description: 'Insufficient cash balance or invalid input' })
	@ApiResponse({ status: 404, description: 'Portfolio or stock not found' })
	async buyStock(@Request() req, @Body() dto: BuyStockDto)
	{
		return this.tradingService.buyStock(req.user.id, dto);
	}

	@Post('sell')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Sell stock for current user' })
	@ApiResponse({ status: 201, description: 'Sell order executed' })
	@ApiResponse({ status: 400, description: 'Insufficient position quantity or invalid input' })
	@ApiResponse({ status: 404, description: 'Portfolio or stock not found' })
	async sellStock(@Request() req, @Body() dto: SellStockDto)
	{
		return this.tradingService.sellStock(req.user.id, dto);
	}

	@Get('positions')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get current user positions' })
	@ApiResponse({ status: 200, description: 'List of user positions' })
	async getPositions(@Request() req)
	{
		return this.tradingService.getPositions(req.user.id);
	}

	@Get('history')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get current user trade history' })
	@ApiResponse({ status: 200, description: 'List of user trades' })
	async getTradeHistory(@Request() req)
	{
		return this.tradingService.getTradeHistory(req.user.id);
	}
}
