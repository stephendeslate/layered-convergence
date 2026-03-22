// TRACED:AE-API-04 — Dashboards controller with full CRUD and Cache-Control
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  async create(@Body() dto: CreateDashboardDto): Promise<Record<string, unknown>> {
    return this.dashboardsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.dashboardsService.findAll(
      tenantId,
      parseInt(page, 10) || 1,
      parseInt(pageSize, 10) || 20,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Record<string, unknown>> {
    return this.dashboardsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ): Promise<Record<string, unknown>> {
    return this.dashboardsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.dashboardsService.remove(id);
  }
}
