import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Request } from 'express';

@Controller('api/v1/dashboards')
@UseGuards(AuthGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  async create(
    @Req() req: Request & { user: { tenantId: string } },
    @Body() dto: CreateDashboardDto,
  ) {
    return this.dashboardsService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request & { user: { tenantId: string } },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardsService.findAll(
      req.user.tenantId,
      cursor,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.dashboardsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    await this.dashboardsService.remove(req.user.tenantId, id);
  }
}
