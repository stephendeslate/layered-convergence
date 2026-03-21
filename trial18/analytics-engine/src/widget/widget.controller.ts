import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';
import { AuthenticatedRequest } from '../common/authenticated-request';

@Controller('widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest, @Query('dashboardId') dashboardId: string) {
    return this.widgetService.findAll(req.tenantId, dashboardId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.widgetService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateWidgetDto) {
    return this.widgetService.create(req.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.widgetService.remove(req.tenantId, id);
  }
}
