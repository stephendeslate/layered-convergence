import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('work-orders')
@UseGuards(CompanyGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(
    @CurrentCompany() company: { id: string },
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrderService.create(company.id, dto);
  }

  @Get()
  findAll(
    @CurrentCompany() company: { id: string },
    @Query('status') status?: string,
    @Query('technicianId') technicianId?: string,
  ) {
    return this.workOrderService.findAllByCompany(company.id, { status, technicianId });
  }

  @Get('analytics')
  getAnalytics(@CurrentCompany() company: { id: string }) {
    return this.workOrderService.getAnalytics(company.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrderService.findOne(id);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
  ) {
    return this.workOrderService.transition(id, dto.status, dto.note, dto.technicianId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workOrderService.remove(id);
  }
}
