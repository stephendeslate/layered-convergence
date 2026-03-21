import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query('dashboardId') dashboardId?: string) {
    return this.widgetService.findAll(req.tenantId, dashboardId);
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.widgetService.findOne(req.tenantId, id);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateWidgetDto) {
    return this.widgetService.create(req.tenantId, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.widgetService.remove(req.tenantId, id);
  }
}
