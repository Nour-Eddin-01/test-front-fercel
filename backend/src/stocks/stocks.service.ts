import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockQueryDto } from './dto/stock-query.dto';
import { PriceHistoryQueryDto } from './dto/price-history-query.dto';

@Injectable()
export class StocksService {
    private readonly logger = new Logger(StocksService.name);

    constructor(private prisma: PrismaService) {}


    async findAll(query: StockQueryDto)
    {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        this.logger.log(`Fetching stocks list, page ${page}, limit ${limit}`);
        try
        {
        
            const skip = (page - 1) * limit;
        
            const where: any = {};
        
            if (query.sector)
            {
                where.sector = query.sector;
            }
        
            if (query.search)
            {
                where.OR =
                [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { isin: { contains: query.search, mode: 'insensitive' } }
                ];
            }
        
            const [stocks, total] = await Promise.all([
                this.prisma.stock.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                this.prisma.stock.count({ where })
            ]);

            this.logger.log(`Fetched ${total} stocks`);
            return {
                data: stocks,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error)
        {
            this.logger.error('Failed to fetch stocks', error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch stocks',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findOneById(id: string)
    {
        this.logger.log(`Fetching stock by id ${id}`);
        try
        {
            const stock = await this.prisma.stock.findUnique(
                {
                    where: { id },
                }
            );
            if (!stock)
            {
                this.logger.warn(`Stock not found, id ${id}`);
                throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
            }
            return stock;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch stock by id ${id}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch stock',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findOneByIsin(isin: string)
    {
        this.logger.log(`Fetching stock by isin ${isin}`);
        try
        {
            const stock = await this.prisma.stock.findUnique(
                {
                    where: { isin },
                }
            );
            if (!stock)
            {
                this.logger.warn(`Stock not found, isin ${isin}`);
                throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
            }
            return stock;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch stock by isin ${isin}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch stock',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findPriceHistory(stockId: string, query: PriceHistoryQueryDto)
    {
        this.logger.log(`Fetching price history for stock ${stockId}`);
        try
        {
            const stock = await this.prisma.stock.findUnique(
                {
                    where: { id: stockId },
                }
            );
            if (!stock)
            {
                this.logger.warn(`Stock not found for price history, stockId ${stockId}`);
                throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
            }

            const limit = query.limit ?? 30;
            const where: any = { stockId };

            if (query.from || query.to)
            {
                where.timestamp = {};
                if (query.from)
                    where.timestamp.gte = new Date(query.from);
                if (query.to)
                    where.timestamp.lte = new Date(query.to);
            }

            const [data, total] = await Promise.all([
                this.prisma.priceHistory.findMany({
                    where,
                    orderBy: { timestamp: 'desc' },
                    take: limit,
                }),
                this.prisma.priceHistory.count({ where }),
            ]);

            this.logger.log(`Fetched ${data.length} price history entries for stock ${stockId}`);
            return {
                data,
                meta: {
                    limit,
                    total,
                },
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch price history for stock ${stockId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch price history',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}
