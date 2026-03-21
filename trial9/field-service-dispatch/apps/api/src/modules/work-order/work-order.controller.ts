import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto, TransitionWorkOrderDto, AssignWorkOrderDto } from './work-order.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompanyId } from '../../common/decorators/company.decorator';

@Controller('work-orders')
@UseGuards(CompanyGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(@CurrentCompanyId() companyId: string, @Body() dto: CreateWorkOrderDto) {
    return this.workOrderService.create(companyId, dto);
  }

  @Get()
  findAll(@CurrentCompanyId() companyId: string, @Query('status') status?: string) {
    return this.workOrderService.findAllByCompany(companyId, status);
  }

  @Get('analytics')
  getAnalytics(@CurrentCompanyId() companyId: string) {
    return this.workOrderService.getAnalytics(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.workOrderService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrderService.update(id, dto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignWorkOrderDto) {
    return this.workOrderService.assign(id, dto.technicianId);
  }

  @Post(':id/transition')
  transition(@Param('id') id: string, @Body() dto: TransitionWorkOrderDto) {
    return this.workOrderService.transition(id, dto.toStatus, dto.note);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.workOrderService.delete(id);
  }
}
