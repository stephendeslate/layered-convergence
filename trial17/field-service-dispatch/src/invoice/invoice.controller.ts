import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('invoices')
@UseGuards(AuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.invoiceService.findAll(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.invoiceService.findOne(req.companyId, id);
  }

  @Patch(':id/paid')
  markPaid(@Req() req: any, @Param('id') id: string) {
    return this.invoiceService.markPaid(req.companyId, id);
  }
}
