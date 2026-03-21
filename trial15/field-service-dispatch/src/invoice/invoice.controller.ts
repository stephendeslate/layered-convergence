import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CompanyRequest } from '../common/middleware/company-context.middleware';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Req() req: CompanyRequest, @Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(req.companyId, dto);
  }

  @Get()
  findAll(@Req() req: CompanyRequest) {
    return this.invoiceService.findAll(req.companyId);
  }

  @Get(':id')
  findOne(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.invoiceService.findOne(id, req.companyId);
  }

  @Put(':id')
  update(@Req() req: CompanyRequest, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, req.companyId, dto);
  }

  @Delete(':id')
  remove(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.invoiceService.remove(id, req.companyId);
  }

  @Put(':id/pay')
  markPaid(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.invoiceService.markPaid(id, req.companyId);
  }

  @Get('work-order/:workOrderId')
  findByWorkOrder(@Req() req: CompanyRequest, @Param('workOrderId') workOrderId: string) {
    return this.invoiceService.findByWorkOrder(workOrderId, req.companyId);
  }
}
