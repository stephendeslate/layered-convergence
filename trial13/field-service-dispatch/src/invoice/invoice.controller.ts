import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import express from 'express';
import { InvoiceService } from './invoice.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('work-order/:workOrderId')
  create(
    @Req() req: express.Request,
    @Param('workOrderId') workOrderId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoiceService.createForWorkOrder(req.companyId!, workOrderId, dto);
  }

  @Get()
  findAll(@Req() req: express.Request) {
    return this.invoiceService.findAll(req.companyId!);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }
}
