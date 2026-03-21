import { Controller, Get, Post, Patch, Body, Param, Req, Query } from '@nestjs/common';
import express from 'express';
import { WorkOrderService } from './work-order.service.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto.js';

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

  @Patch(':id/transition')
  transition(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
  ) {
    return this.workOrderService.transition(req.companyId!, id, dto);
  }

  @Post(':id/auto-assign')
  autoAssign(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Query('skills') skills?: string,
  ) {
    const skillList = skills ? skills.split(',') : [];
    return this.workOrderService.autoAssign(req.companyId!, id, skillList);
  }

  @Get(':id/history')
  getHistory(@Req() req: express.Request, @Param('id') id: string) {
    return this.workOrderService.getHistory(req.companyId!, id);
  }
}
