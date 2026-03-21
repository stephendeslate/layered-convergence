import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.invoiceService.findAll(req.companyId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.invoiceService.findById(id, req.companyId);
  }

  @Post()
  async create(@Body() dto: CreateInvoiceDto, @Req() req: AuthenticatedRequest) {
    return this.invoiceService.create(dto, req.companyId);
  }
}
