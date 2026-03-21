import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WidgetService } from './widget.service.js';
import { CreateWidgetDto } from './dto/create-widget.dto.js';
import { UpdateWidgetDto } from './dto/update-widget.dto.js';

@Controller('dashboards/:dashboardId/widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetService.create(dashboardId, dto);
  }

  @Get()
  findAll(@Param('dashboardId') dashboardId: string) {
    return this.widgetService.findAll(dashboardId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.widgetService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.widgetService.remove(id);
  }
}
