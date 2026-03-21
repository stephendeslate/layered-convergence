import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('work-orders')
@UseGuards(AuthGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query('status') status?: WorkOrderStatus) {
    return this.workOrderService.findAll(req.companyId, status);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.workOrderService.findOne(req.companyId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrderService.update(req.companyId, id, dto);
  }

  @Patch(':id/transition')
  transition(@Req() req: any, @Param('id') id: string, @Body() dto: TransitionWorkOrderDto) {
    return this.workOrderService.transition(req.companyId, id, dto.status);
  }
}
