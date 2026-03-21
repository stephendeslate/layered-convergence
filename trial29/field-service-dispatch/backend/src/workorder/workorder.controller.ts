import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { WorkOrderService } from './workorder.service';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  async findAll(@Query('companyId') companyId: string) {
    return this.workOrderService.findAllByCompany(companyId);
  }

  @Get('count')
  async count(@Query('companyId') companyId: string) {
    const count = await this.workOrderService.countByCompanyRaw(companyId);
    return { count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workOrderService.findById(id);
  }

  @Patch(':id/status')
  async transition(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.workOrderService.transitionStatus(id, status);
  }

  @Patch(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('technicianId') technicianId: string,
  ) {
    return this.workOrderService.assignTechnician(id, technicianId);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    return this.workOrderService.completeWorkOrder(id);
  }
}
