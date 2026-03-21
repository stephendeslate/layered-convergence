import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('widgets')
@UseGuards(AuthGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(@Body() dto: CreateWidgetDto) {
    return this.widgetService.create(dto);
  }

  @Get('dashboard/:dashboardId')
  findByDashboardId(@Param('dashboardId') dashboardId: string) {
    return this.widgetService.findByDashboardId(dashboardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.widgetService.findOne(id);
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
