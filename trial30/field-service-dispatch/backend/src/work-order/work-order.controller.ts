import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  findAll(@Query('technicianId') technicianId?: string) {
    if (technicianId) {
      return this.workOrderService.findByTechnician(technicianId);
    }
    return this.workOrderService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.workOrderService.findById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description: string;
      priority: string;
      estimatedCost?: number;
      customerId: string;
      serviceAreaId?: string;
    },
  ) {
    return this.workOrderService.create(body);
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: string;
      technicianId?: string;
      actualCost?: number;
    },
  ) {
    return this.workOrderService.transitionStatus(
      id,
      body.status,
      body.technicianId,
      body.actualCost,
    );
  }
}
