import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto, TransitionWorkOrderDto } from './dto/create-work-order.dto';
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
  ) {
    return this.workOrderService.findAllByCompany(company.id, status);
  }

  @Get('analytics')
  getAnalytics(@CurrentCompany() company: { id: string }) {
    return this.workOrderService.getAnalytics(company.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.workOrderService.findOne(id, company.id);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @Body() dto: TransitionWorkOrderDto,
  ) {
    return this.workOrderService.transition(id, company.id, dto);
  }

  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @Body('technicianId') technicianId: string,
  ) {
    return this.workOrderService.assign(id, company.id, technicianId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.workOrderService.remove(id, company.id);
  }
}
