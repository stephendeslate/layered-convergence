import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { LineItemService, CreateLineItemDto, UpdateLineItemDto } from './line-item.service';
import { CurrentCompany, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/decorators';

@Controller('line-items')
export class LineItemController {
  constructor(private readonly lineItemService: LineItemService) {}

  @Post()
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async create(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateLineItemDto,
  ) {
    return this.lineItemService.create(companyId, dto, user.sub);
  }

  @Post('bulk')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async bulkCreate(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { workOrderId: string; items: Omit<CreateLineItemDto, 'workOrderId'>[] },
  ) {
    return this.lineItemService.bulkCreate(
      companyId,
      body.workOrderId,
      body.items,
      user.sub,
    );
  }

  @Get('work-order/:workOrderId')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async listByWorkOrder(
    @CurrentCompany() companyId: string,
    @Param('workOrderId') workOrderId: string,
  ) {
    return this.lineItemService.listByWorkOrder(companyId, workOrderId);
  }

  @Get('work-order/:workOrderId/totals')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async calculateTotals(
    @CurrentCompany() companyId: string,
    @Param('workOrderId') workOrderId: string,
  ) {
    return this.lineItemService.calculateTotals(companyId, workOrderId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DISPATCHER', 'TECHNICIAN')
  async update(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateLineItemDto,
  ) {
    return this.lineItemService.update(companyId, id, dto, user.sub);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async delete(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    await this.lineItemService.delete(companyId, id, user.sub);
    return { message: 'Line item deleted' };
  }
}
