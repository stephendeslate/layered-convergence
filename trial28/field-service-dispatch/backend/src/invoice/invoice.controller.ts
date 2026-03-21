import { Controller, Get, Param, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from '@prisma/client';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll(@Query('status') status?: string): Promise<Invoice[]> {
    if (status) {
      return this.invoiceService.findByStatus(status);
    }
    return this.invoiceService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Invoice | null> {
    return this.invoiceService.findById(id);
  }
}
