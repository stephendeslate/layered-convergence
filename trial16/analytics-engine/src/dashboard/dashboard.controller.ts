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
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('dashboards')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateDashboardDto) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.dashboardService.create(tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.dashboardService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.dashboardService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.dashboardService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const tenantId = (req as Record<string, unknown>)['tenantId'] as string;
    return this.dashboardService.remove(tenantId, id);
  }
}
