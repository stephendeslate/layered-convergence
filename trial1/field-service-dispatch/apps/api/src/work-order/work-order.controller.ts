import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkOrderService, CreateWorkOrderDto, CompleteWorkOrderDto, WorkOrderListQuery } from './work-order.service';
import { CurrentCompany, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/decorators';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER')
  async create(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrderService.create(companyId, dto, user.sub);
  }

  @Get()
  async list(
    @CurrentCompany() companyId: string,
    @Query() query: WorkOrderListQuery,
  ) {
    return this.workOrderService.list(companyId, query);
  }

  @Get(':id')
  async get(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.workOrderService.get(companyId, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async update(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWorkOrderDto>,
  ) {
    return this.workOrderService.update(companyId, id, dto, user.sub);
  }

  @Post(':id/assign')
  @Roles('ADMIN', 'DISPATCHER')
  @HttpCode(HttpStatus.OK)
  async assign(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { technicianId: string },
  ) {
    return this.workOrderService.assign(companyId, id, body.technicianId, user.sub);
  }

  @Post(':id/start-route')
  @HttpCode(HttpStatus.OK)
  async startRoute(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.workOrderService.startRoute(companyId, id, user.sub);
  }

  @Post(':id/arrive')
  @HttpCode(HttpStatus.OK)
  async arrive(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { latitude?: number; longitude?: number },
  ) {
    return this.workOrderService.arrive(companyId, id, user.sub, body.latitude, body.longitude);
  }

  @Post(':id/start-work')
  @HttpCode(HttpStatus.OK)
  async startWork(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.workOrderService.startWork(companyId, id, user.sub);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CompleteWorkOrderDto,
  ) {
    return this.workOrderService.complete(companyId, id, dto, user.sub);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'DISPATCHER')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.workOrderService.cancel(companyId, id, body.reason, user.sub);
  }

  @Post(':id/generate-invoice')
  @Roles('ADMIN', 'DISPATCHER')
  @HttpCode(HttpStatus.OK)
  async generateInvoice(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.workOrderService.generateInvoice(companyId, id, user.sub);
  }
}
