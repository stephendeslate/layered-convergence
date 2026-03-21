// [TRACED:AC-014] Widget controller with tenant-scoped CRUD

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthRequest {
  user: { sub: string; tenantId: string; role: string };
}

@Controller('widgets')
@UseGuards(JwtAuthGuard)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get()
  findByDashboard(
    @Query('dashboardId') dashboardId: string,
    @Request() req: AuthRequest,
  ) {
    return this.widgetService.findByDashboard(dashboardId, req.user.tenantId);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      type: string;
      config?: object;
      dashboardId: string;
    },
    @Request() req: AuthRequest,
  ) {
    return this.widgetService.create({
      ...body,
      tenantId: req.user.tenantId,
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; type?: string; config?: object },
    @Request() req: AuthRequest,
  ) {
    return this.widgetService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.widgetService.remove(id, req.user.tenantId);
  }
}
