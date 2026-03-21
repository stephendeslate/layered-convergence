import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';

@Controller('widgets')
@UseFilters(PrismaExceptionFilter)
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Post()
  create(@Body() dto: CreateWidgetDto) {
    return this.widgetsService.create(dto);
  }

  @Get()
  findByDashboard(@Query('dashboardId') dashboardId: string) {
    return this.widgetsService.findByDashboard(dashboardId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.widgetsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.widgetsService.remove(id);
  }
}
