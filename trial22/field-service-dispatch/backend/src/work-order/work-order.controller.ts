import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';

interface AuthenticatedRequest {
  user: { userId: string; companyId: string; role: string };
}

// TRACED:AC-004 Work orders support filtering by status
@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: WorkOrderStatus,
  ) {
    return this.workOrderService.findAll(req.user.companyId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.workOrderService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateWorkOrderDto, @Req() req: AuthenticatedRequest) {
    return this.workOrderService.create(dto, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.update(id, dto, req.user.companyId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.updateStatus(id, dto, req.user.companyId);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignTechnicianDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.assign(id, dto, req.user.companyId);
  }
}
