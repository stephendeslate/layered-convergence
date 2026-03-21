import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';

// TRACED: AE-API-DASH-LIST-001 — Dashboard endpoints with JWT guard
@Controller('dashboards')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dashboardService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : DEFAULT_PAGE_SIZE,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() body: { name: string },
    @Request() req: { user: { tenantId: string; userId: string } },
  ) {
    return this.dashboardService.create(req.user.tenantId, req.user.userId, body.name);
  }
}
