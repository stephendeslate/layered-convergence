import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './invoice.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompanyId } from '../../common/decorators/company.decorator';

@Controller('invoices')
@UseGuards(CompanyGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Get()
  findByCompany(@CurrentCompanyId() companyId: string) {
    return this.invoiceService.findByCompany(companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.invoiceService.findById(id);
  }

  @Post(':id/send')
  sendInvoice(@Param('id') id: string) {
    return this.invoiceService.sendInvoice(id);
  }

  @Post(':id/mark-paid')
  markPaid(@Param('id') id: string) {
    return this.invoiceService.markPaid(id);
  }
}
