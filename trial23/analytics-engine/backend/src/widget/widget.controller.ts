import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('widgets')
@UseGuards(JwtAuthGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(@Body() body: { name: string; type: string; dashboardId: string; config?: Record<string, unknown> }) {
    return this.widgetService.create(body);
  }

  @Get('dashboard/:dashboardId')
  findAll(@Param('dashboardId') dashboardId: string) {
    return this.widgetService.findAll(dashboardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.widgetService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; type?: string; config?: Record<string, unknown> }) {
    return this.widgetService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.widgetService.remove(id);
  }
}
