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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('api/dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateDashboardDto,
  ) {
    const data = await this.dashboardService.create(tenantId, dto);
    return { data };
  }

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.dashboardService.list(tenantId, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dashboardService.get(id, tenantId);
    return { data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    const data = await this.dashboardService.update(id, tenantId, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    await this.dashboardService.delete(id, tenantId);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dashboardService.publish(id, tenantId);
    return { data };
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archive(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dashboardService.archive(id, tenantId);
    return { data };
  }

  @Post(':id/revert-to-draft')
  @HttpCode(HttpStatus.OK)
  async revertToDraft(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dashboardService.revertToDraft(id, tenantId);
    return { data };
  }

  @Post(':id/duplicate')
  async duplicate(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.dashboardService.duplicate(id, tenantId);
    return { data };
  }
}
