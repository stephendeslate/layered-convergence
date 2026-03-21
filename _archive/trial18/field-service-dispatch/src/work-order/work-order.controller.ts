import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { WorkOrderService } from './work-order.service.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto.js';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.findAllByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.findOne(id, companyId);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignWorkOrderDto,
    @Req() req: Request,
  ) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.assign(id, companyId, dto.technicianId);
  }

  @Patch(':id/unassign')
  unassign(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.unassign(id, companyId);
  }

  @Patch(':id/en-route')
  enRoute(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.enRoute(id, companyId);
  }

  @Patch(':id/on-site')
  onSite(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.onSite(id, companyId);
  }

  @Patch(':id/start')
  start(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.start(id, companyId);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.complete(id, companyId);
  }

  @Patch(':id/reassign')
  reassign(
    @Param('id') id: string,
    @Body() dto: AssignWorkOrderDto,
    @Req() req: Request,
  ) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.reassign(id, companyId, dto.technicianId);
  }

  @Post(':id/auto-assign')
  autoAssign(@Param('id') id: string, @Req() req: Request) {
    // Type assertion justified: companyId set by CompanyContextMiddleware
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.workOrderService.autoAssign(id, companyId);
  }
}
