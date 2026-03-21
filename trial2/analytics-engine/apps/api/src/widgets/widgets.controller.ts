import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { Request } from 'express';

@Controller('api/v1/dashboards/:dashboardId/widgets')
@UseGuards(AuthGuard)
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Post()
  async create(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.widgetsService.create(req.user.tenantId, dashboardId, dto);
  }

  @Patch(':widgetId')
  async update(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.widgetsService.update(req.user.tenantId, dashboardId, widgetId, dto);
  }

  @Delete(':widgetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: Request & { user: { tenantId: string } },
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
  ) {
    await this.widgetsService.remove(req.user.tenantId, dashboardId, widgetId);
  }
}
