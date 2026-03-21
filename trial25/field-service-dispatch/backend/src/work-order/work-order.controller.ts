// [TRACED:API-004] Work order endpoints protected by JwtAuthGuard
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string; companyId: string } }) {
    return this.workOrderService.findAll(req.user.id, req.user.companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workOrderService.findOne(id, req.user.id, req.user.companyId);
  }

  @Post()
  async create(
    @Body()
    body: {
      title: string;
      description: string;
      priority?: number;
      scheduledAt?: Date;
      customerId: string;
      technicianId?: string;
    },
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workOrderService.create(body, req.user.id, req.user.companyId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workOrderService.updateStatus(
      id,
      body.status as never,
      req.user.id,
      req.user.companyId,
    );
  }
}
