import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DispatchAnalyticsQueryDto } from './dto/dispatch-analytics-query.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@Query() query: DispatchAnalyticsQueryDto) {
    return this.analyticsService.getOverview(query);
  }
}
