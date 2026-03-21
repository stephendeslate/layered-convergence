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
  Req,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { id: string; email: string; role: string; companyId: string };
}

@UseGuards(JwtAuthGuard)
@Controller('work-orders')
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.workOrderService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.workOrderService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateWorkOrderDto, @Req() req: AuthenticatedRequest) {
    return this.workOrderService.create(dto, req.user.companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.update(id, dto, req.user.companyId);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionWorkOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.workOrderService.transition(id, dto, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.workOrderService.remove(id, req.user.companyId);
  }
}
