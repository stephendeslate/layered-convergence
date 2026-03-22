// TRACED: AE-API-03
// TRACED: AE-API-08
// TRACED: AE-PERF-05
// TRACED: AE-PERF-07
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
  Header,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { paginate, clampPageSize, MAX_PAGE_SIZE } from '@analytics-engine/shared';

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
  @Header('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedSize = pageSize
      ? clampPageSize(parseInt(pageSize, 10), MAX_PAGE_SIZE)
      : undefined;

    const { items, total } = await this.dashboardsService.findAll(
      req.user.tenantId,
      parsedPage,
      parsedSize,
    );
    return paginate(items, total, {
      page: parsedPage,
      pageSize: parsedSize,
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
