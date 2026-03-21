import { Controller, Get, Post, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.findAll(req.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dashboardService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(req.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dashboardService.remove(req.tenantId, id);
  }
}
