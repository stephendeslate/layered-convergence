import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.workOrderService.findAllByCompany(companyId);
  }

  @Get('count')
  async count(@Query('companyId') companyId: string) {
    const count = await this.workOrderService.countByCompanyRaw(companyId);
    return { count };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrderService.findById(id);
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.workOrderService.transitionStatus(id, status);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body('technicianId') technicianId: string,
  ) {
    return this.workOrderService.assignTechnician(id, technicianId);
  }
}
