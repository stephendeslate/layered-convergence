import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service.js';
import { CreateDashboardDto } from './dto/create-dashboard.dto.js';
import { UpdateDashboardDto } from './dto/update-dashboard.dto.js';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dashboardService.create(tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dashboardService.findAll(tenantId);
  }

  @Get(':id')
  findById(@Req() req: Request, @Param('id') id: string) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dashboardService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dashboardService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    // type assertion justified: tenantId set by TenantContextMiddleware
    const tenantId = (req as Request & { tenantId: string }).tenantId;
    return this.dashboardService.remove(tenantId, id);
  }
}
