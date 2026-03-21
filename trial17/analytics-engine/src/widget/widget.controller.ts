import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { WidgetService } from './widget.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';

@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  async create(
    @Req() req: Request & { tenantId: string },
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetService.create(req.tenantId, dto);
  }

  @Get()
  async findByDashboard(
    @Req() req: Request & { tenantId: string },
    @Query('dashboardId') dashboardId: string,
  ) {
    return this.widgetService.findByDashboard(req.tenantId, dashboardId);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.widgetService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { tenantId: string },
    @Param('id') id: string,
  ) {
    return this.widgetService.remove(req.tenantId, id);
  }
}
