import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.dashboardService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dashboardService.findById(id);
  }

  @Post()
  create(@Body() body: { title: string; tenantId: string; userId: string }) {
    return this.dashboardService.create(body);
  }

  @Post(':id/widgets')
  addWidget(
    @Param('id') id: string,
    @Body() body: { type: string; config: string },
  ) {
    return this.dashboardService.addWidget(id, body.type, body.config);
  }
}
