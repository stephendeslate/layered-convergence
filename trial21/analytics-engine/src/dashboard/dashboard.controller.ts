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
import { CreateDashboardDto } from './dto/create-dashboard.dto';

@Controller('dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.dashboardService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.findById(id, req.user.tenantId);
  }

  @Post()
  create(
    @Body() dto: CreateDashboardDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateDashboardDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.dashboardService.delete(id, req.user.tenantId);
  }
}
