import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { metricsModule } from 'src/common/monitoring/metrics/metrics.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StocksModule } from './stocks/stocks.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { TradingModule } from './trading/trading.module';
import { PostsModule } from './posts/posts.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StocksModule,
    ChatModule,
    NotificationsModule,
    PortfolioModule,
    TradingModule,
    PostsModule,
    SocialModule,
    metricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
  