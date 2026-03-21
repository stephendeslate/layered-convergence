import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

@Controller('dashboards')
@UseFilters(PrismaExceptionFilter)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  create(@Body() dto: CreateDashboardDto) {
    return this.dashboardsService.create(dto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.dashboardsService.findAll(tenantId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dashboardsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    return this.dashboardsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardsService.remove(id);
  }
}
