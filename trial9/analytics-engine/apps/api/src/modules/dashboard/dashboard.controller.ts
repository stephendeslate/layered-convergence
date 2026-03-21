import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@Controller('dashboards')
@UseGuards(ApiKeyGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@CurrentTenant() tenant: { id: string }, @Body() dto: CreateDashboardDto) {
    return this.dashboardService.create(tenant.id, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenant: { id: string }) {
    return this.dashboardService.findAllByTenant(tenant.id);
  }

  @Get(':id')
  findById(@Param('id') id: string, @CurrentTenant() tenant: { id: string }) {
    return this.dashboardService.findById(id, tenant.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentTenant() tenant: { id: string },
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(id, tenant.id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentTenant() tenant: { id: string }) {
    return this.dashboardService.delete(id, tenant.id);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentTenant() tenant: { id: string }) {
    return this.dashboardService.publish(id, tenant.id);
  }
}
