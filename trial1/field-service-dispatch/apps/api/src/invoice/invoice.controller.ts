import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvoiceService, InvoiceListQuery } from './invoice.service';
import { CurrentCompany, CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/decorators';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  async list(
    @CurrentCompany() companyId: string,
    @Query() query: InvoiceListQuery,
  ) {
    return this.invoiceService.list(companyId, query);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async get(
    @CurrentCompany() companyId: string,
    @Param('id') id: string,
  ) {
    return this.invoiceService.get(companyId, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DISPATCHER')
  async update(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: { notes?: string; dueDate?: string },
  ) {
    return this.invoiceService.update(companyId, id, dto, user.sub);
  }

  @Post(':id/pay')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async markPaid(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { stripePaymentIntentId?: string },
  ) {
    return this.invoiceService.markPaid(companyId, id, body, user.sub);
  }

  @Post('generate')
  @Roles('ADMIN', 'DISPATCHER')
  @HttpCode(HttpStatus.OK)
  async generate(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { workOrderId: string },
  ) {
    return this.invoiceService.generate(companyId, body.workOrderId, user.sub);
  }
}
