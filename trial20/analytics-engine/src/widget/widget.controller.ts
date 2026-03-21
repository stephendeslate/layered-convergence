import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWidgetDto } from './dto/create-widget.dto';

@Controller('widgets')
@UseGuards(JwtAuthGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get('dashboard/:dashboardId')
  findByDashboard(
    @Param('dashboardId') dashboardId: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.findByDashboard(dashboardId, req.user.tenantId);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.findById(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() dto: CreateWidgetDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.create(dto, req.user.tenantId);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.widgetService.delete(id, req.user.tenantId);
  }
}
