import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(dto);
  }

  @Get()
  findAllByTenant(@Query('tenantId') tenantId: string) {
    return this.dashboardService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dashboardService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    return this.dashboardService.update(id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.dashboardService.publish(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.dashboardService.delete(id);
  }
}
