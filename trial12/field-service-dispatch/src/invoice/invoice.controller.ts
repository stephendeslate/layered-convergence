import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import express from 'express';
import { InvoiceService } from './invoice.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Req() req: express.Request, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(req.companyId!, dto);
  }

  @Get()
  findAll(@Req() req: express.Request) {
    return this.invoiceService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id/pay')
  markPaid(@Req() req: express.Request, @Param('id') id: string) {
    return this.invoiceService.markPaid(req.companyId!, id);
  }
}
