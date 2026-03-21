import { Controller, Get, Post, Put, Patch, Param, Body, Req } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.workOrderService.findAll(req.companyId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.workOrderService.findById(id, req.companyId);
  }

  @Post()
  async create(@Body() dto: CreateWorkOrderDto, @Req() req: AuthenticatedRequest) {
    return this.workOrderService.create(dto, req.companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.update(id, dto, req.companyId);
  }

  @Patch(':id/transition')
  async transition(
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.transition(id, dto.status, req.companyId);
  }
}
