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
import { WidgetService } from './widget.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('dashboards/:dashboardId/widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetService.create(tenantId, dashboardId, dto);
  }

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Param('dashboardId') dashboardId: string,
  ) {
    return this.widgetService.findAllByDashboard(tenantId, dashboardId);
  }

  @Get(':id')
  async findById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('id') id: string,
  ) {
    return this.widgetService.findById(tenantId, dashboardId, id);
  }

  @Patch(':id')
  async update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(tenantId, dashboardId, id, dto);
  }

  @Delete(':id')
  async delete(
    @Headers('x-tenant-id') tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('id') id: string,
  ) {
    return this.widgetService.delete(tenantId, dashboardId, id);
  }
}
