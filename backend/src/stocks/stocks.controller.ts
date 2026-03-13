import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { StockQueryDto } from './dto/stock-query.dto';
import { PriceHistoryQueryDto } from './dto/price-history-query.dto';

@ApiTags('stocks')
@Controller('stocks')
export class StocksController {
    constructor(private stocksService: StocksService) {}

    @Get()
    @ApiOperation({ summary: 'List stocks with pagination and filters' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'sector', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiResponse({ status: 200, description: 'Paginated list of stocks' })
    async getStocks(@Query() query: StockQueryDto)
    {
        return this.stocksService.findAll(query);
    }

    @Get('isin/:isin')
    @ApiOperation({ summary: 'Get a stock by ISIN' })
    @ApiParam({ name: 'isin', description: 'Stock ISIN code' })
    @ApiResponse({ status: 200, description: 'Stock found' })
    @ApiResponse({ status: 404, description: 'Stock not found' })
    async getStockByIsin(@Param('isin') isin: string)
    {
        return this.stocksService.findOneByIsin(isin);
    }

    @Get(':id/history')
    @ApiOperation({ summary: 'Get price history for a stock' })
    @ApiParam({ name: 'id', description: 'Stock id (cuid)' })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'from', required: false })
    @ApiQuery({ name: 'to', required: false })
    @ApiResponse({ status: 200, description: 'Price history entries' })
    @ApiResponse({ status: 404, description: 'Stock not found' })
    async getStockPriceHistory(
        @Param('id') id: string,
        @Query() query: PriceHistoryQueryDto,
    )
    {
        return this.stocksService.findPriceHistory(id, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a stock by id' })
    @ApiParam({ name: 'id', description: 'Stock id (cuid)' })
    @ApiResponse({ status: 200, description: 'Stock found' })
    @ApiResponse({ status: 404, description: 'Stock not found' })
    async getStockById(@Param('id') id: string)
    {
        return this.stocksService.findOneById(id);
    }
}
