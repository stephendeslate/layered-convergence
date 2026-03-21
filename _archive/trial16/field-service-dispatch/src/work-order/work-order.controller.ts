import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import express from 'express';
import { WorkOrderService } from './work-order.service.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto.js';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto.js';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Req() req: express.Request, @Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: express.Request) {
    return this.workOrderService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Req() req: express.Request, @Param('id') id: string) {
    return this.workOrderService.findOne(req.companyId!, id);
  }

  @Patch(':id/assign')
  assign(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() dto: AssignWorkOrderDto,
  ) {
    return this.workOrderService.assign(req.companyId!, id, dto.technicianId);
  }

  @Patch(':id/transition')
  transition(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
  ) {
    return this.workOrderService.transition(req.companyId!, id, dto);
  }

  @Post(':id/auto-assign')
  autoAssign(@Req() req: express.Request, @Param('id') id: string) {
    return this.workOrderService.autoAssign(req.companyId!, id);
  }
}
