import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BuyStockDto } from './dto/buy-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';

@Injectable()
export class TradingService
{
	private readonly logger = new Logger(TradingService.name);

	constructor(private prisma: PrismaService) {}

	async buyStock(userId: string, dto: BuyStockDto)
	{
		this.logger.log(`Buy request started for user ${userId}, stock ${dto.stockId}, quantity ${dto.quantity}`);
		try
		{
			return await this.prisma.$transaction(
				async (tx) =>
				{
					const stock = await tx.stock.findUnique({ where: { id: dto.stockId } });
					if (!stock)
					{
						this.logger.warn(`Buy failed: stock ${dto.stockId} not found for user ${userId}`);
						this.logger.warn({ action: 'buy', status: 'failed' });
						throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
					}

					const portfolio = await tx.portfolio.findUnique({ where: { userId } });
					if (!portfolio)
					{
						this.logger.warn(`Buy failed: portfolio not found for user ${userId}`);
						this.logger.warn({ action: 'buy', status: 'failed' });
						throw new HttpException('Portfolio not found', HttpStatus.NOT_FOUND);
					}

					const quantity = dto.quantity;
					const price = Number(stock.currentPrice);
					const totalCost = price * quantity;
					const cashBalance = Number(portfolio.cashBalance);

					if (cashBalance < totalCost)
					{
						this.logger.warn(`Buy failed: insufficient cash for user ${userId}`);
						throw new HttpException('Insufficient cash balance', HttpStatus.BAD_REQUEST);
					}

					const existingPosition = await tx.position.findUnique(
						{
							where:
							{
								portfolioId_stockId:
								{
									portfolioId: portfolio.id,
									stockId: stock.id,
								},
							},
						}
					);

					if (existingPosition)
					{
						this.logger.log(`Updating existing position for user ${userId}, stock ${stock.id}`);
						const oldQuantity = existingPosition.quantity;
						const oldAverage = Number(existingPosition.averageCost);
						const newQuantity = oldQuantity + quantity;
						const newAverage = ((oldAverage * oldQuantity) + totalCost) / newQuantity;

						const currentValue = price * newQuantity;
						const pnl = currentValue - (newAverage * newQuantity);
						const pnlPercent = newAverage > 0
							? (pnl / (newAverage * newQuantity)) * 100
							: 0;

						await tx.position.update(
							{
								where: { id: existingPosition.id },
								data:
								{
									quantity: newQuantity,
									averageCost: newAverage,
									currentPrice: price,
									totalValue: currentValue,
									pnl,
									pnlPercent,
								},
							}
						);
					}
					else
					{
						this.logger.log(`Creating new position for user ${userId}, stock ${stock.id}`);
						await tx.position.create(
							{
								data:
								{
									portfolioId: portfolio.id,
									userId,
									stockId: stock.id,
									quantity,
									averageCost: price,
									currentPrice: price,
									totalValue: totalCost,
									pnl: 0,
									pnlPercent: 0,
								},
							}
						);
					}

					await tx.trade.create(
						{
							data:
							{
								portfolioId: portfolio.id,
								userId,
								stockId: stock.id,
								type: 'buy',
								quantity,
								price,
								totalValue: totalCost,
							},
						}
					);

					const positionsAggregate = await tx.position.aggregate(
						{
							where: { portfolioId: portfolio.id },
							_sum: { totalValue: true },
						}
					);

					const newCashBalance = cashBalance - totalCost;
					const positionsValue = Number(positionsAggregate._sum.totalValue ?? 0);
					const totalPortfolioValue = newCashBalance + positionsValue;

					const updatedPortfolio = await tx.portfolio.update(
						{
							where: { id: portfolio.id },
							data:
							{
								cashBalance: newCashBalance,
								totalValue: totalPortfolioValue,
							},
						}
					);

					await tx.user.update(
						{
							where: { id: userId },
							data: { totalBalance: totalPortfolioValue },
						}
					);
	                this.logger.log( { buy_successfully: ''} );
					this.logger.log(`Buy executed successfully for user ${userId}, stock ${stock.id}, quantity ${quantity}`);
					return {
						message: 'Buy order executed successfully',
						order:
						{
							stockId: stock.id,
							isin: stock.isin,
							quantity,
							price,
							totalValue: totalCost,
							type: 'buy',
						},
						portfolio:
						{
							id: updatedPortfolio.id,
							cashBalance: updatedPortfolio.cashBalance,
							totalValue: updatedPortfolio.totalValue,
						},
					};
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
			);
		}
		catch (error)
		{
			this.logger.log( { buy_failed: ''} );
			if (error instanceof HttpException)
				throw error;
			this.logger.error(`Buy failed for user ${userId}`, error instanceof Error ? error.stack : undefined);
			throw new HttpException(
				'Failed to execute buy order',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async sellStock(userId: string, dto: SellStockDto)
	{
		this.logger.log(`Sell request started for user ${userId}, stock ${dto.stockId}, quantity ${dto.quantity}`);
		try
		{
			return await this.prisma.$transaction(
				async (tx) =>
				{
					const stock = await tx.stock.findUnique({ where: { id: dto.stockId } });
					if (!stock)
					{
						this.logger.warn(`Sell failed: stock ${dto.stockId} not found for user ${userId}`);
						this.logger.warn({ action: 'sell', status: 'failed' });
						throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
					}

					const portfolio = await tx.portfolio.findUnique({ where: { userId } });
					if (!portfolio)
					{
						this.logger.warn(`Sell failed: portfolio not found for user ${userId}`);
						this.logger.warn({ action: 'sell', status: 'failed' });
						throw new HttpException('Portfolio not found', HttpStatus.NOT_FOUND);
					}

					const existingPosition = await tx.position.findUnique(
						{
							where:
							{
								portfolioId_stockId:
								{
									portfolioId: portfolio.id,
									stockId: stock.id,
								},
							},
						}
					);

					if (!existingPosition)
					{
						this.logger.warn(`Sell failed: no position found for user ${userId}, stock ${dto.stockId}`);
						this.logger.warn({ action: 'sell', status: 'failed' });
						throw new HttpException('No position found for this stock', HttpStatus.BAD_REQUEST);
					}

					const quantity = dto.quantity;
					if (existingPosition.quantity < quantity)
					{
						this.logger.warn(`Sell failed: insufficient quantity for user ${userId}, stock ${dto.stockId}`);
						this.logger.warn({ action: 'sell', status: 'failed' });
						throw new HttpException('Insufficient position quantity', HttpStatus.BAD_REQUEST);
					}

					const price = Number(stock.currentPrice);
					const proceeds = price * quantity;
					const averageCost = Number(existingPosition.averageCost);
					const realizedPnl = (price - averageCost) * quantity;

					const remainingQuantity = existingPosition.quantity - quantity;

					if (remainingQuantity === 0)
					{
						this.logger.log(`Position fully closed for user ${userId}, stock ${stock.id}`);
						await tx.position.delete({ where: { id: existingPosition.id } });
					}
					else
					{
						const currentValue = price * remainingQuantity;
						const pnl = currentValue - (averageCost * remainingQuantity);
						const pnlPercent = averageCost > 0
							? (pnl / (averageCost * remainingQuantity)) * 100
							: 0;

						await tx.position.update(
							{
								where: { id: existingPosition.id },
								data:
								{
									quantity: remainingQuantity,
									currentPrice: price,
									totalValue: currentValue,
									pnl,
									pnlPercent,
								},
							}
						);
					}

					await tx.trade.create(
						{
							data:
							{
								portfolioId: portfolio.id,
								userId,
								stockId: stock.id,
								type: 'sell',
								quantity,
								price,
								totalValue: proceeds,
							},
						}
					);

					const positionsAggregate = await tx.position.aggregate(
						{
							where: { portfolioId: portfolio.id },
							_sum: { totalValue: true },
						}
					);

					const newCashBalance = Number(portfolio.cashBalance) + proceeds;
					const positionsValue = Number(positionsAggregate._sum.totalValue ?? 0);
					const totalPortfolioValue = newCashBalance + positionsValue;

					const updatedPortfolio = await tx.portfolio.update(
						{
							where: { id: portfolio.id },
							data:
							{
								cashBalance: newCashBalance,
								totalValue: totalPortfolioValue,
							},
						}
					);

					await tx.user.update(
						{
							where: { id: userId },
							data: { totalBalance: totalPortfolioValue },
						}
					);

	                this.logger.log( { sell_successfully: ''} );
					this.logger.log(`Sell executed successfully for user ${userId}, stock ${stock.id}, quantity ${quantity}`);
					return {
						message: 'Sell order executed successfully',
						order:
						{
							stockId: stock.id,
							isin: stock.isin,
							quantity,
							price,
							totalValue: proceeds,
							realizedPnl,
							type: 'sell',
						},
						portfolio:
						{
							id: updatedPortfolio.id,
							cashBalance: updatedPortfolio.cashBalance,
							totalValue: updatedPortfolio.totalValue,
						},
					};
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
			);
		}
		catch (error)
		{
			this.logger.log( { sell_failed: ''} );
			this.logger.error(`Sell failed for user ${userId}`, error instanceof Error ? error.stack : undefined);
			if (error instanceof HttpException)
				throw error;
			throw new HttpException(
				'Failed to execute sell order',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getPositions(userId: string)
	{
		this.logger.log(`Fetching positions for user ${userId}`);
		try
		{
			const positions = await this.prisma.position.findMany(
				{
					where: { userId },
					include: { stock: true },
					orderBy: { updatedAt: 'desc' },
				}
			);

			this.logger.log(`Fetched ${positions.length} positions for user ${userId}`);
			return positions.map((position) =>
			{
				const currentPrice = Number(position.stock.currentPrice);
				const averageCost = Number(position.averageCost);
				const currentValue = currentPrice * position.quantity;
				const pnl = currentValue - (averageCost * position.quantity);
				const pnlPercent = averageCost > 0
					? (pnl / (averageCost * position.quantity)) * 100
					: 0;

				return {
					id: position.id,
					stockId: position.stockId,
					quantity: position.quantity,
					averageCost: position.averageCost,
					currentPrice: position.stock.currentPrice,
					currentValue,
					pnl,
					pnlPercent,
					stock: position.stock,
				};
			});
		}
		catch (error)
		{
			this.logger.error(`Failed to fetch positions for user ${userId}`, error instanceof Error ? error.stack : undefined);
			throw new HttpException(
				'Failed to fetch positions',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getTradeHistory(userId: string)
	{
		this.logger.log(`Fetching trade history for user ${userId}`);
		try
		{
			return await this.prisma.trade.findMany(
				{
					where: { userId },
					include:
					{
						stock:
						{
							select:
							{
								id: true,
								isin: true,
								name: true,
								sector: true,
							},
						},
					},
					orderBy: { executedAt: 'desc' },
				}
			);
		}
		catch (error)
		{
			this.logger.error(`Failed to fetch trade history for user ${userId}`, error instanceof Error ? error.stack : undefined);
			throw new HttpException(
				'Failed to fetch trade history',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
