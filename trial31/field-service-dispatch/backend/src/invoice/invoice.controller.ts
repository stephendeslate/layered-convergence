import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.invoiceService.findAllByCompany(companyId);
  }

  @Get('revenue')
  async revenue(@Query('companyId') companyId: string) {
    const total = await this.invoiceService.totalRevenueByCompany(companyId);
    return { total };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findById(id);
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.invoiceService.transitionStatus(id, status);
  }
}
