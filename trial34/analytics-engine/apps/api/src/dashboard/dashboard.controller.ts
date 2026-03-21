import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async findAll(@Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Body() body: { name: string; description?: string },
    @Request() req: { user: { tenantId: string; userId: string } },
  ) {
    return this.dashboardService.create(body.name, body.description, req.user.tenantId, req.user.userId);
  }
}
