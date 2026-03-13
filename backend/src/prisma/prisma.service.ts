import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PrismaQuery');

  async onModuleInit() {
    await this.$connect();

    // Modern Prisma Extension for Query Logging
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const start = Date.now();
            const result = await query(args);
            const end = Date.now();
            
            // This sends the clean JSON your Logstash needs
            new Logger('PrismaQuery').log({
              "type": "database_query",
              "db_model": model,
              "db_action": operation,
              "request_time": (end - start) / 1000,
              "service": "nginx-traffic"
            });
            
            return result;
          },
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}