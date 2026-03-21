import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { WorkOrder } from '@prisma/client';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  async findAll(): Promise<WorkOrder[]> {
    return this.workOrderService.findAll();
  }

  @Get('stats')
  async stats(): Promise<{ status: string; count: bigint }[]> {
    return this.workOrderService.countByStatus();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<WorkOrder | null> {
    return this.workOrderService.findById(id);
  }

  @Patch(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('technicianId') technicianId: string,
  ): Promise<{ success: boolean }> {
    await this.workOrderService.assignTechnician(id, technicianId);
    return { success: true };
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.workOrderService.completeWorkOrder(id);
    return { success: true };
  }
}
