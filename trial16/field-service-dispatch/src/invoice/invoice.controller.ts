import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/invoice.dto';
import { Request } from 'express';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.invoiceService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.invoiceService.findById(req.companyId!, id);
  }
}
