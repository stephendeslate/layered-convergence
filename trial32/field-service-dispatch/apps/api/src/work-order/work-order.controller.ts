import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { companyId: string };
}

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.workOrderService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.workOrderService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() body: { title: string; description: string; priority: string; customerId: string; technicianId?: string; scheduledAt?: Date }, @Request() req: AuthenticatedRequest) {
    return this.workOrderService.create({ ...body, companyId: req.user.companyId });
  }

  @Patch(':id/transition')
  transition(@Param('id') id: string, @Body() body: { status: string }, @Request() req: AuthenticatedRequest) {
    return this.workOrderService.transition(id, req.user.companyId, body.status as 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED');
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.workOrderService.remove(id, req.user.companyId);
  }
}
