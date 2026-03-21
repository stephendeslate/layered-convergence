import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService, AnalyticsQuery } from './analytics.service';
import { CurrentCompany, Roles } from '../common/decorators';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('ADMIN', 'DISPATCHER')
  async dashboard(
    @CurrentCompany() companyId: string,
    @Query() query: AnalyticsQuery,
  ) {
    return this.analyticsService.getDashboard(companyId, query);
  }

  @Get('jobs')
  @Roles('ADMIN', 'DISPATCHER')
  async jobs(
    @CurrentCompany() companyId: string,
    @Query() query: AnalyticsQuery,
  ) {
    return this.analyticsService.getJobMetrics(companyId, query);
  }

  @Get('technician-utilization')
  @Roles('ADMIN', 'DISPATCHER')
  async technicianUtilization(
    @CurrentCompany() companyId: string,
    @Query() query: AnalyticsQuery,
  ) {
    return this.analyticsService.getTechnicianUtilization(companyId, query);
  }

  @Get('revenue')
  @Roles('ADMIN', 'DISPATCHER')
  async revenue(
    @CurrentCompany() companyId: string,
    @Query() query: AnalyticsQuery,
  ) {
    return this.analyticsService.getRevenueMetrics(companyId, query);
  }

  @Get('sla')
  @Roles('ADMIN', 'DISPATCHER')
  async sla(
    @CurrentCompany() companyId: string,
    @Query() query: AnalyticsQuery,
  ) {
    return this.analyticsService.getSlaMetrics(companyId, query);
  }
}
