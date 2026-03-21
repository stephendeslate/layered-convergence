import { Module } from '@nestjs/common';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService } from './admin-analytics.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [AdminAnalyticsController],
  providers: [AdminAnalyticsService, PrismaService],
  exports: [AdminAnalyticsService],
})
export class AdminAnalyticsModule {}
