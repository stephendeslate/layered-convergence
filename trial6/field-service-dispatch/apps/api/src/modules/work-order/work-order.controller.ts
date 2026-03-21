import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto, AssignWorkOrderDto, WorkOrderQueryDto } from './dto/create-work-order.dto';
import { WorkOrderStatus } from '@prisma/client';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(dto);
  }

  @Get()
  findAll(@Query() query: WorkOrderQueryDto) {
    return this.workOrderService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrderService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrderService.update(id, dto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignWorkOrderDto) {
    return this.workOrderService.assign(id, dto);
  }

  @Post(':id/status/:status')
  transition(
    @Param('id') id: string,
    @Param('status') status: WorkOrderStatus,
  ) {
    return this.workOrderService.transition(id, status);
  }
}
