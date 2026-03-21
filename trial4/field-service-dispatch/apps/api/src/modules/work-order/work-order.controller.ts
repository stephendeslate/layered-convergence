import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto, TransitionWorkOrderDto, AssignWorkOrderDto } from './work-order.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  async create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrderService.create(companyId, dto);
  }

  // Static routes before parameterized — per v3.0 Section 5.9
  @Get('stats')
  async getStats(@Headers('x-company-id') companyId: string) {
    return this.workOrderService.getStats(companyId);
  }

  // [PUBLIC_ENDPOINT] Customer tracking — accessed by token, no tenant scope
  @Get('tracking/:token')
  async findByTrackingToken(@Param('token') token: string) {
    return this.workOrderService.findByTrackingToken(token);
  }

  @Get()
  async findAll(@Headers('x-company-id') companyId: string) {
    return this.workOrderService.findAllByCompany(companyId);
  }

  @Get(':id')
  async findById(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.workOrderService.findById(companyId, id);
  }

  @Post(':id/assign')
  async assign(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: AssignWorkOrderDto,
  ) {
    return this.workOrderService.assign(companyId, id, dto);
  }

  @Post(':id/transition')
  async transition(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
  ) {
    return this.workOrderService.transition(companyId, id, dto);
  }
}
