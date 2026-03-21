import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CompanyContextGuard } from '../common/guards/company-context.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { TransitionStatusDto } from './dto/transition-status.dto';

@Controller('work-orders')
@UseGuards(CompanyContextGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(companyId, dto);
  }

  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.workOrdersService.findAll(companyId);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.workOrdersService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  transitionStatus(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: TransitionStatusDto,
  ) {
    return this.workOrdersService.transitionStatus(companyId, id, dto);
  }

  @Post(':id/auto-assign')
  autoAssign(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.workOrdersService.autoAssign(companyId, id);
  }

  @Delete(':id')
  delete(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.workOrdersService.delete(companyId, id);
  }
}
