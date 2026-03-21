// [TRACED:AC-006] Dashboard controller with JWT-protected CRUD endpoints

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthRequest {
  user: { sub: string; tenantId: string; role: string };
}

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.dashboardService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() body: { name: string },
    @Request() req: AuthRequest,
  ) {
    return this.dashboardService.create({
      name: body.name,
      tenantId: req.user.tenantId,
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string },
    @Request() req: AuthRequest,
  ) {
    return this.dashboardService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }
}
