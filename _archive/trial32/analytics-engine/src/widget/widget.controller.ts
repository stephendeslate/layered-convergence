import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { WidgetService } from './widget.service.js';
import { CreateWidgetDto } from './dto/create-widget.dto.js';
import { UpdateWidgetDto } from './dto/update-widget.dto.js';

@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(@Body() dto: CreateWidgetDto) {
    return this.widgetService.create(dto);
  }

  @Get()
  findAllByDashboard(@Query('dashboardId') dashboardId: string) {
    return this.widgetService.findAllByDashboard(dashboardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.widgetService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.widgetService.remove(id);
  }
}
