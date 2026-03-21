import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DispatchService } from './dispatch.service';
import { DEFAULT_PAGE_SIZE } from '@field-service-dispatch/shared';
import type { WorkOrderStatus } from '@field-service-dispatch/shared';

// TRACED: FD-API-WO-LIST-001 — Work order endpoints with JWT guard
@Controller('work-orders')
@UseGuards(AuthGuard('jwt'))
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get()
  findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.dispatchService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : DEFAULT_PAGE_SIZE,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.dispatchService.findOne(id, req.user.tenantId);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: WorkOrderStatus },
    @Request() req: { user: { tenantId: string; userId: string } },
  ) {
    return this.dispatchService.transition(id, body.status, req.user.userId, req.user.tenantId);
  }
}
