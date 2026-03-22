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
  Req,
} from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string; tenantId: string };
}

// TRACED: AE-API-004
@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dashboardsService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.dashboardsService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: { name: string; description?: string; config?: Record<string, unknown> },
  ) {
    return this.dashboardsService.create(req.user.tenantId, req.user.id, body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { name?: string; description?: string; config?: Record<string, unknown> },
  ) {
    return this.dashboardsService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.dashboardsService.remove(id, req.user.tenantId);
  }
}
