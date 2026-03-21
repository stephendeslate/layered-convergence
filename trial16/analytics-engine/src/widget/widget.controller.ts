import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('widgets')
@UseGuards(AuthGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWidgetDto) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.widgetService.create(tenantId, dto);
  }

  @Get()
  findByDashboard(
    @Req() req: Request,
    @Query('dashboardId') dashboardId: string,
  ) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.widgetService.findByDashboard(tenantId, dashboardId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.widgetService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.widgetService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.widgetService.remove(tenantId, id);
  }
}
