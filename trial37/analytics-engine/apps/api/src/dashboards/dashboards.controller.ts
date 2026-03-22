// TRACED: AE-API-03
// TRACED: AE-API-08
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
  Request,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { paginate } from '@analytics-engine/shared';

interface AuthenticatedRequest {
  user: { id: string; tenantId: string; email: string; role: string };
}

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateDashboardDto) {
    return this.dashboardsService.create(req.user.tenantId, req.user.id, dto);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const { items, total } = await this.dashboardsService.findAll(
      req.user.tenantId,
    );
    return paginate(items, total, {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const dashboard = await this.dashboardsService.findOne(id, req.user.tenantId);
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    const dashboard = await this.dashboardsService.findOne(id, req.user.tenantId);
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return this.dashboardsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const dashboard = await this.dashboardsService.findOne(id, req.user.tenantId);
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return this.dashboardsService.remove(id);
  }
}
