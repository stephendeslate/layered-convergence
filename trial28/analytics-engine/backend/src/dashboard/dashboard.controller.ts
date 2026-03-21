import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async findAll(@Query('tenantId') tenantId: string) {
    return this.dashboardService.findAllByTenant(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dashboardService.findById(id);
  }

  @Post()
  async create(
    @Body() body: { title: string; tenantId: string; userId: string },
  ) {
    return this.dashboardService.create(body);
  }
}
