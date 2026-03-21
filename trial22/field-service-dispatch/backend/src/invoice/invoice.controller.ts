import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

interface AuthenticatedRequest {
  user: { userId: string; companyId: string; role: string };
}

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.invoiceService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.invoiceService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateInvoiceDto, @Req() req: AuthenticatedRequest) {
    return this.invoiceService.create(dto, req.user.companyId);
  }
}
