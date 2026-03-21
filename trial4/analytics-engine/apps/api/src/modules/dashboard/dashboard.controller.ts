import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('dashboards')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.dashboardService.create(tenantId, dto);
  }

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.dashboardService.findAllByTenant(tenantId);
  }

  @Get(':id')
  async findById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.dashboardService.findById(tenantId, id);
  }

  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(tenantId, id, dto);
  }

  @Delete(':id')
  async delete(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.dashboardService.delete(tenantId, id);
  }

  @Post(':id/publish')
  async publish(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.dashboardService.publish(tenantId, id);
  }
}
