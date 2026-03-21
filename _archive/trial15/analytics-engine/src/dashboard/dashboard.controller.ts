import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(req.tenantId!, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.dashboardService.findAll(req.tenantId!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.dashboardService.findOne(req.tenantId!, id);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    return this.dashboardService.update(req.tenantId!, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.dashboardService.remove(req.tenantId!, id);
  }
}
