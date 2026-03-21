import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.dashboardsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDashboardDto, @Req() req: any) {
    return this.dashboardsService.create(dto, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    return this.dashboardsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardsService.remove(id);
  }

  @Post(':id/widgets')
  addWidget(@Param('id') id: string, @Body() dto: CreateWidgetDto) {
    return this.dashboardsService.addWidget(id, dto);
  }

  @Patch(':dashboardId/widgets/:widgetId')
  updateWidget(
    @Param('widgetId') widgetId: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.dashboardsService.updateWidget(widgetId, dto);
  }

  @Delete(':dashboardId/widgets/:widgetId')
  removeWidget(@Param('widgetId') widgetId: string) {
    return this.dashboardsService.removeWidget(widgetId);
  }
}
