import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { WorkOrderStatus } from '@prisma/client';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(dto);
  }

  @Get()
  findAllByCompany(
    @Query('companyId') companyId: string,
    @Query('status') status?: WorkOrderStatus,
  ) {
    return this.workOrderService.findAllByCompany(companyId, status);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.workOrderService.findById(id);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.workOrderService.getTimeline(id);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
  ) {
    return this.workOrderService.transition(id, dto);
  }

  @Post(':id/assign')
  assignTechnician(
    @Param('id') id: string,
    @Body() body: { technicianId: string },
  ) {
    return this.workOrderService.assignTechnician(id, body.technicianId);
  }
}
