// TRACED:AE-API-02 — DashboardsController full CRUD with normalizePageParams and Cache-Control
// TRACED:AE-PERF-08 — Dashboard list uses normalizePageParams and Cache-Control headers

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { normalizePageParams } from '@analytics-engine/shared';

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDashboardDto) {
    return this.dashboardsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') rawPage?: string,
    @Query('pageSize') rawPageSize?: string,
    @Query('tenantId') tenantId?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const { page, pageSize } = normalizePageParams(
      Number(rawPage) || 1,
      Number(rawPageSize) || 20,
    );

    res?.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');

    return this.dashboardsService.findAll({ page, pageSize, tenantId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dashboardsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    return this.dashboardsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.dashboardsService.remove(id);
  }
}
