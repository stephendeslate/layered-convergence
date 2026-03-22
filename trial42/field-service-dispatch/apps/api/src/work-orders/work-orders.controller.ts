// TRACED: FD-WORK-ORDERS-CONTROLLER
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.workOrdersService.findAll(
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
      tenantId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrdersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.workOrdersService.remove(id);
  }
}
