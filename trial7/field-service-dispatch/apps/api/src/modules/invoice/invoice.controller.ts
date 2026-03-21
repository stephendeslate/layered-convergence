import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';

@Controller('invoices')
@UseGuards(CompanyGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.invoiceService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOneOrThrow(id);
  }

  @Post(':id/mark-paid')
  markPaid(
    @Param('id') id: string,
    @Body('stripePaymentIntentId') stripePaymentIntentId: string,
  ) {
    return this.invoiceService.markPaid(id, stripePaymentIntentId);
  }
}
