import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('admin/analytics')
@UseGuards(AuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('overview')
  getOverview() {
    return this.adminAnalyticsService.getOverview();
  }

  @Get('transactions-by-status')
  getTransactionsByStatus() {
    return this.adminAnalyticsService.getTransactionsByStatus();
  }
}
