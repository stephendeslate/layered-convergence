import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('query')
  query(@Query() dto: QueryAnalyticsDto) {
    return this.analyticsService.query(dto);
  }

  @Get('kpi')
  getKpi(@Query('dataSourceId') dataSourceId: string) {
    return this.analyticsService.getKpi(dataSourceId);
  }
}
