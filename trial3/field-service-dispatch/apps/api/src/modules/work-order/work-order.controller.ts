import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';

/**
 * [VERIFY:ROUTE_ORDERING] Static routes defined BEFORE parameterized routes.
 * This prevents NestJS route shadowing where :id would match 'stats' or 'tracking'.
 */
@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  async create(@Body() body: {
    companyId: string;
    customerId: string;
    priority?: string;
    description: string;
    serviceType: string;
    scheduledAt?: string;
    estimatedDuration?: number;
  }) {
    return this.workOrderService.create(body.companyId, {
      ...body,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
  }

  // STATIC ROUTES FIRST [VERIFY:ROUTE_ORDERING]

  @Get('stats')
  async getStats(@Query('companyId') companyId: string) {
    return this.workOrderService.getStats(companyId);
  }

  @Get('tracking/:token')
  async getByTrackingToken(@Param('token') token: string) {
    return this.workOrderService.findByTrackingToken(token);
  }

  // PARAMETERIZED ROUTES AFTER STATIC ROUTES

  @Get(':id')
  async findById(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.workOrderService.findByIdAndCompany(id, companyId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.workOrderService.findByIdAndCompany(id, companyId);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body() body: { companyId: string; technicianId: string },
  ) {
    return this.workOrderService.assign(id, body.companyId, body.technicianId);
  }

  @Post(':id/auto-assign')
  async autoAssign(
    @Param('id') id: string,
    @Body() body: { companyId: string },
  ) {
    return this.workOrderService.autoAssign(id, body.companyId);
  }

  @Post(':id/status')
  async transitionStatus(
    @Param('id') id: string,
    @Body() body: { companyId: string; status: string; note?: string },
  ) {
    return this.workOrderService.transitionStatus(id, body.companyId, body.status, body.note);
  }
}
