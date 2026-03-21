// TRACED: FD-WO-002 — Work orders REST controller
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  async create(
    @Request() req: { user: { sub: string; tenantId: string } },
    @Body() body: { title: string; description?: string; priority?: string; latitude?: string; longitude?: string },
  ) {
    return this.workOrdersService.create(req.user.tenantId, req.user.sub, body);
  }

  @Get()
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.workOrdersService.findAll(
      req.user.tenantId,
      Number(page) || 1,
      Number(pageSize) || 20,
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.workOrdersService.updateStatus(req.user.tenantId, id, body.status);
  }
}
