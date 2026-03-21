// TRACED:WO_TRANSITION_ENDPOINT — PATCH /work-orders/:id/transition endpoint exists

import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.workOrderService.findAll(user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.workOrderService.findOne(id, user.companyId);
  }

  @Post()
  create(
    @Body() dto: CreateWorkOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workOrderService.create({
      ...dto,
      companyId: user.companyId,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateWorkOrderDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workOrderService.update(id, user.companyId, dto);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workOrderService.transition(id, user.companyId, dto.status);
  }
}
