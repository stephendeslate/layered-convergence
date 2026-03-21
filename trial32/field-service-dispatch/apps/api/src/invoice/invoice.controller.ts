import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { companyId: string };
}

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.invoiceService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.invoiceService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() body: { amount: number; currency: string; workOrderId: string; customerId: string }, @Request() req: AuthenticatedRequest) {
    return this.invoiceService.create({ ...body, companyId: req.user.companyId });
  }

  @Patch(':id/pay')
  markPaid(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.invoiceService.markPaid(id, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.invoiceService.remove(id, req.user.companyId);
  }
}
