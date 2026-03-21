import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.invoiceService.findAll(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.invoiceService.findById(id);
  }

  @Post(':id/mark-paid')
  markPaid(@Param('id') id: string) {
    return this.invoiceService.markPaid(id);
  }
}
