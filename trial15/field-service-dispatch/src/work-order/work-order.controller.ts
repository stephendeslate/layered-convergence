import { Controller, Get, Post, Put, Body, Param, Req, Query } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';
import { CompanyRequest } from '../common/middleware/company-context.middleware';
import { WorkOrderStatus } from '@prisma/client';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Req() req: CompanyRequest, @Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: CompanyRequest, @Query('status') status?: WorkOrderStatus) {
    if (status) {
      return this.workOrderService.findByStatus(status, req.companyId);
    }
    return this.workOrderService.findAll(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.workOrderService.findOne(id, req.companyId);
  }

  @Put(':id/assign')
  assign(@Req() req: CompanyRequest, @Param('id') id: string, @Body() dto: AssignWorkOrderDto) {
    return this.workOrderService.assign(id, req.companyId, dto);
  }

  @Put(':id/transition')
  transition(@Req() req: CompanyRequest, @Param('id') id: string, @Body() dto: TransitionWorkOrderDto) {
    return this.workOrderService.transition(id, req.companyId, dto.status);
  }

  @Get(':id/transitions')
  getValidTransitions(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.workOrderService.findOne(id, req.companyId).then((wo) => ({
      currentStatus: wo.status,
      validTransitions: this.workOrderService.getValidTransitions(wo.status),
    }));
  }

  @Get('technician/:technicianId')
  findByTechnician(@Req() req: CompanyRequest, @Param('technicianId') technicianId: string) {
    return this.workOrderService.findByTechnician(technicianId, req.companyId);
  }
}
