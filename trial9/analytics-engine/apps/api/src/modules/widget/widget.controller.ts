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
import { WidgetService } from './widget.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('widgets')
@UseGuards(ApiKeyGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(@Body() dto: CreateWidgetDto) {
    return this.widgetService.create(dto);
  }

  @Get('dashboard/:dashboardId')
  findByDashboard(@Param('dashboardId') dashboardId: string) {
    return this.widgetService.findByDashboard(dashboardId);
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
  delete(@Param('id') id: string) {
    return this.widgetService.delete(id);
  }
}
