import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dashboardService.findOne(req.tenantId, id);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(req.tenantId, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.dashboardService.remove(req.tenantId, id);
  }
}
