import { Controller, Post, Patch, Get, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { InvoiceService } from './invoice.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';

@Controller()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('invoices/work-order/:workOrderId')
  createFromWorkOrder(
    @Param('workOrderId') workOrderId: string,
    @Body() dto: CreateInvoiceDto,
    @Req() req: Request,
  ) {
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.invoiceService.createFromWorkOrder(
      workOrderId,
      companyId,
      dto.amount,
    );
  }

  @Patch('invoices/:id/pay')
  markPaid(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.invoiceService.markPaid(id, companyId);
  }

  @Get('invoices')
  findAll(@Req() req: Request) {
    const companyId = (req as Request & { companyId: string }).companyId;
    return this.invoiceService.findAllByCompany(companyId);
  }
}
