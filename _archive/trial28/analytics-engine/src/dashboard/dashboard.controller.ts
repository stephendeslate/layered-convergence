import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { CreateDashboardDto } from './dto/create-dashboard.dto.js';
import { UpdateDashboardDto } from './dto/update-dashboard.dto.js';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(req.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.dashboardService.findAll(req.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.dashboardService.findOne(req.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.dashboardService.remove(req.tenantId, id);
  }
}
