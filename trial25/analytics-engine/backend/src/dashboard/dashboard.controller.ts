import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() body: { title: string; isPublic?: boolean },
    @Request() req: { user: { tenantId: string; userId: string } },
  ) {
    return this.dashboardService.create({
      ...body,
      tenantId: req.user.tenantId,
      ownerId: req.user.userId,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; isPublic?: boolean },
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.remove(id, req.user.tenantId);
  }
}
