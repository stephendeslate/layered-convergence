import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';

@Controller('work-orders')
@UseGuards(CompanyGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(companyId, dto);
  }

  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.workOrderService.findAll(companyId);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.workOrderService.findOneOrThrow(companyId, id);
  }

  @Post(':id/transition')
  transition(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
  ) {
    return this.workOrderService.transition(companyId, id, dto);
  }

  @Post(':id/assign/:technicianId')
  assignTechnician(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Param('technicianId') technicianId: string,
  ) {
    return this.workOrderService.assignTechnician(companyId, id, technicianId);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.workOrderService.remove(companyId, id);
  }
}
