import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(
    @Body() body: { name: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }
}
