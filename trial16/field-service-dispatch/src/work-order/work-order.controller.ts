import { Controller, Get, Post, Patch, Delete, Param, Body, Req, Query, UseGuards } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Request } from 'express';

@Controller('work-orders')
@UseGuards(AuthGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query('status') status?: WorkOrderStatus) {
    return this.workOrderService.findAll(req.companyId!, status);
  }

  @Get('counts')
  getCountsByStatus(@Req() req: Request) {
    return this.workOrderService.getCountsByStatus(req.companyId!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.workOrderService.findById(req.companyId!, id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrderService.update(req.companyId!, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.workOrderService.remove(req.companyId!, id);
  }

  @Patch(':id/transition')
  transition(@Req() req: Request, @Param('id') id: string, @Body() dto: TransitionWorkOrderDto) {
    return this.workOrderService.transition(req.companyId!, id, dto.status);
  }

  @Patch(':id/assign')
  assign(@Req() req: Request, @Param('id') id: string, @Body() dto: AssignWorkOrderDto) {
    return this.workOrderService.assign(req.companyId!, id, dto.technicianId);
  }
}
