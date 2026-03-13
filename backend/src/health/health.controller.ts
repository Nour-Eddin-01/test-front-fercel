import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // We try to perform a simple "count" query to the DB
      const userCount = await this.prisma.user.count();
      
      return {
        status: 'ok',
        database: 'connected',
        totalUsers: userCount,
        message: 'TradeHub Engine is running smooth 🚀'
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        message: 'The engine is broken 🛑'
      };
    }
  }
}
