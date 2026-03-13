import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortfolioService } from './portfolio.service';
import { PerformanceQueryDto } from './dto/performance-query.dto';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
    constructor(private portfolioService: PortfolioService) {}

    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user portfolio statistics' })
    @ApiResponse({ status: 200, description: 'Portfolio stats' })
    @ApiResponse({ status: 404, description: 'Portfolio not found' })
    async getPortfolioStats(@Request() req)
    {
        return this.portfolioService.getPortfolioStats(req.user.id);
    }

    @Get('performance')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get performance history over last N days' })
    @ApiQuery({ name: 'days', required: false })
    @ApiResponse({ status: 200, description: 'Performance data' })
    @ApiResponse({ status: 404, description: 'Portfolio not found' })
    async getPerformance(
        @Request() req,
        @Query() query: PerformanceQueryDto,
    )
    {
        const days = query.days ?? 30;
        return this.portfolioService.getPerformance(req.user.id, days);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user portfolio' })
    @ApiResponse({ status: 200, description: 'Portfolio with positions' })
    @ApiResponse({ status: 404, description: 'Portfolio not found' })
    async getPortfolio(@Request() req)
    {
        return this.portfolioService.getPortfolio(req.user.id);
    }

    @Get(':userId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get portfolio by user id' })
    @ApiParam({ name: 'userId', description: 'User id (cuid)' })
    @ApiResponse({ status: 200, description: 'Portfolio with positions' })
    @ApiResponse({ status: 404, description: 'Portfolio not found' })
    async getPortfolioByUserId(@Param('userId') userId: string)
    {
        return this.portfolioService.getPortfolio(userId);
    }
}
