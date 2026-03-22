// TRACED: FD-WO-002 — Work orders REST controller with DTO classes
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateWorkOrderStatusDto } from './dto/update-work-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  async create(
    @Request() req: { user: { sub: string; tenantId: string } },
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrdersService.create(req.user.tenantId, req.user.sub, dto);
  }

  @Get()
  async findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.workOrdersService.findAll(
      req.user.tenantId,
      Number(page) || 1,
      Number(pageSize) || 20,
    );
  }

  @Get(':id')
  async findOne(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.workOrdersService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  async update(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(req.user.tenantId, id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderStatusDto,
  ) {
    return this.workOrdersService.updateStatus(req.user.tenantId, id, dto.status);
  }

  @Delete(':id')
  async remove(
    @Request() req: { user: { tenantId: string } },
    @Param('id') id: string,
  ) {
    return this.workOrdersService.remove(req.user.tenantId, id);
  }
}
