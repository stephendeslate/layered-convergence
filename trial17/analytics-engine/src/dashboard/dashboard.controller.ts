import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(
    @Req() req: Request & { tenantId: string },
    @Body() dto: CreateDashboardDto,
  ) {
    return this.dashboardService.create(req.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: Request & { tenantId: string }) {
    return this.dashboardService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.dashboardService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.dashboardService.remove(req.tenantId, id);
  }
}
