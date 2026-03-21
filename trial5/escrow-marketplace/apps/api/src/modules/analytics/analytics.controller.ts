import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@Query() dto: QueryAnalyticsDto) {
    return this.analyticsService.getOverview(dto);
  }

  @Get('volume')
  getVolumeByDay(@Query() dto: QueryAnalyticsDto) {
    return this.analyticsService.getVolumeByDay(dto);
  }

  @Get('payouts')
  getPayoutAnalytics(@Query('userId') userId?: string) {
    return this.analyticsService.getPayoutAnalytics(userId);
  }
}
