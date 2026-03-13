import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PortfolioService {
    private readonly logger = new Logger(PortfolioService.name);

    constructor(private prisma: PrismaService) {}

    async getPortfolio(userId: string)
    {
        this.logger.log(`Fetching portfolio for user ${userId}`);
        try
        {
            const portfolio = await this.prisma.portfolio.findUnique(
                {
                    where: { userId },
                    include:
                    {
                        positions:
                        {
                            include: { stock: true },
                        },
                    },
                }
            );

            if (!portfolio)
            {
                this.logger.warn(`Portfolio not found for user ${userId}`);
                throw new HttpException('Portfolio not found', HttpStatus.NOT_FOUND);
            }

            const positionsWithCurrentValue = portfolio.positions.map((pos) =>
            {
                const currentPrice = Number(pos.stock.currentPrice);
                const quantity = pos.quantity;
                const currentValue = currentPrice * quantity;
                const pnl = currentValue - Number(pos.averageCost) * quantity;
                const pnlPercent =
                    Number(pos.averageCost) > 0
                        ? (pnl / (Number(pos.averageCost) * quantity)) * 100
                        : 0;
                return {
                    id: pos.id,
                    stockId: pos.stockId,
                    quantity: pos.quantity,
                    averageCost: pos.averageCost,
                    currentPrice: pos.stock.currentPrice,
                    currentValue,
                    pnl,
                    pnlPercent,
                    stock: pos.stock,
                };
            });

            const totalPositionsValue = positionsWithCurrentValue.reduce(
                (sum, p) => sum + p.currentValue,
                0,
            );
            const cashBalance = Number(portfolio.cashBalance);
            const totalPortfolioValue = totalPositionsValue + cashBalance;

            return {
                id: portfolio.id,
                userId: portfolio.userId,
                totalValue: totalPortfolioValue,
                cashBalance: portfolio.cashBalance,
                positionsValue: totalPositionsValue,
                positions: positionsWithCurrentValue,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch portfolio for user ${userId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch portfolio',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getPortfolioValue(userId: string)
    {
        this.logger.log(`Fetching portfolio value for user ${userId}`);
        try
        {
            const portfolio = await this.prisma.portfolio.findUnique(
                {
                    where: { userId },
                    include:
                    {
                        positions: { include: { stock: true } },
                    },
                }
            );

            if (!portfolio)
            {
                this.logger.warn(`Portfolio not found for user ${userId}`);
                throw new HttpException('Portfolio not found', HttpStatus.NOT_FOUND);
            }

            const positionsValue = portfolio.positions.reduce(
                (sum, pos) => sum + Number(pos.stock.currentPrice) * pos.quantity,
                0,
            );
            const cashBalance = Number(portfolio.cashBalance);
            return positionsValue + cashBalance;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch portfolio value for user ${userId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch portfolio value',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getPortfolioStats(userId: string)
    {
        this.logger.log(`Fetching portfolio stats for user ${userId}`);
        try
        {
            const portfolio = await this.prisma.portfolio.findUnique(
                {
                    where: { userId },
                    include:
                    {
                        positions: { include: { stock: true } },
                    },
                }
            );

            if (!portfolio)
            {
                this.logger.warn(`Portfolio not found for user ${userId}`);
                throw new HttpException('Portfolio not found', HttpStatus.NOT_FOUND);
            }

            const positions = portfolio.positions;
            const totalInvested = positions.reduce(
                (sum, p) => sum + Number(p.averageCost) * p.quantity,
                0,
            );
            const totalCurrentValue = positions.reduce(
                (sum, p) => sum + Number(p.stock.currentPrice) * p.quantity,
                0,
            );
            const cashBalance = Number(portfolio.cashBalance);
            const totalValue = totalCurrentValue + cashBalance;
            const totalInvestedWithCash = totalInvested + cashBalance;
            const totalPnl = totalValue - totalInvestedWithCash;
            const totalReturnPercent =
                totalInvestedWithCash > 0
                    ? (totalPnl / totalInvestedWithCash) * 100
                    : 0;

            const positionsWithPnl = positions.map((p) =>
            {
                const cost = Number(p.averageCost) * p.quantity;
                const value = Number(p.stock.currentPrice) * p.quantity;
                const pnl = value - cost;
                const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
                return {
                    ...p,
                    currentValue: value,
                    pnl,
                    pnlPercent,
                };
            });

            const sortedByPnl = [...positionsWithPnl].sort(
                (a, b) => b.pnlPercent - a.pnlPercent
            );
            const bestPerforming =
                sortedByPnl.length > 0
                    ? {
                          stockId: sortedByPnl[0].stock.id,
                          name: sortedByPnl[0].stock.name,
                          isin: sortedByPnl[0].stock.isin,
                          pnlPercent: sortedByPnl[0].pnlPercent,
                          pnl: sortedByPnl[0].pnl,
                      }
                    : null;
            const worstPerforming =
                sortedByPnl.length > 0
                    ? (() =>
                    {
                        const worst = sortedByPnl[sortedByPnl.length - 1];
                        return {
                            stockId: worst.stock.id,
                            name: worst.stock.name,
                            isin: worst.stock.isin,
                            pnlPercent: worst.pnlPercent,
                            pnl: worst.pnl,
                        };
                    })()
                    : null;

            const sectorAllocation = positionsWithPnl.reduce<
                Record<string, { value: number; percent: number }>
            >((acc, p) =>
            {
                const sector = p.stock.sector;
                if (!acc[sector]) acc[sector] = { value: 0, percent: 0 };
                acc[sector].value += p.currentValue;
                return acc;
            }, {});
            const totalEquity = totalCurrentValue;
            Object.keys(sectorAllocation).forEach((sector) =>
            {
                sectorAllocation[sector].percent =
                    totalEquity > 0
                        ? (sectorAllocation[sector].value / totalEquity) * 100
                        : 0;
            });

            const uniqueStockIds = new Set(positions.map((p) => p.stockId));

            return {
                totalInvested: totalInvestedWithCash,
                totalCurrentValue: totalValue,
                totalPnl,
                totalReturnPercent,
                numberOfPositions: positions.length,
                numberOfStocks: uniqueStockIds.size,
                bestPerformingStock: bestPerforming,
                worstPerformingStock: worstPerforming,
                sectorAllocation,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch portfolio stats for user ${userId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch portfolio stats',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getPerformance(userId: string, days: number)
    {
        this.logger.log(`Fetching performance for user ${userId}, days ${days}`);
        try
        {
            const portfolio = await this.prisma.portfolio.findUnique(
                {
                    where: { userId },
                }
            );

            if (!portfolio)
            {
                this.logger.warn(`Portfolio not found for user ${userId}`);
                throw new HttpException('Portfolio not found', HttpStatus.NOT_FOUND);
            }

            const currentValue = await this.getPortfolioValue(userId);
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - Math.max(1, days));
            fromDate.setHours(0, 0, 0, 0);

            const trades = await this.prisma.trade.findMany(
                {
                    where:
                    {
                        userId,
                        executedAt: { gte: fromDate },
                    },
                    orderBy: { executedAt: 'asc' },
                }
            );

            const netByDay: Record<string, number> = {};
            trades.forEach((t) =>
            {
                const dateStr = t.executedAt.toISOString().slice(0, 10);
                if (!netByDay[dateStr]) netByDay[dateStr] = 0;
                const total = Number(t.totalValue);
                netByDay[dateStr] += t.type === 'sell' ? total : -total;
            });

            const result: { date: string; value: number; pnl: number }[] = [];
            let value = currentValue;
            const todayStr = new Date().toISOString().slice(0, 10);

            for (let i = 0; i < days; i++)
            {
                const d = new Date();
                d.setDate(d.getDate() - i);
                d.setHours(0, 0, 0, 0);
                const dateStr = d.toISOString().slice(0, 10);
                const dayPnl = netByDay[dateStr] ?? 0;
                if (dateStr === todayStr)
                {
                    result.push({ date: dateStr, value: currentValue, pnl: 0 });
                    value = currentValue - dayPnl;
                }
                else
                {
                    result.push({ date: dateStr, value, pnl: dayPnl });
                    value = value - dayPnl;
                }
            }

            return result.reverse();
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch performance for user ${userId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch performance',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
