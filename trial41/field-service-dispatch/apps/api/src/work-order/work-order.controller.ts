import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Header,
} from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// TRACED: FD-WORK-ORDER-CRUD
@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrderController {
  constructor(private readonly workOrderService: WorkOrderService) {}

  @Post()
  create(
    @Body() dto: CreateWorkOrderDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.workOrderService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.workOrderService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.workOrderService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.workOrderService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.workOrderService.remove(id, req.user.tenantId);
  }
}
