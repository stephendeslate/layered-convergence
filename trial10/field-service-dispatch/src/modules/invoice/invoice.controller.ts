import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CompanyGuard } from '../../common/guards/company.guard';
import { CurrentCompany } from '../../common/decorators/company.decorator';

@Controller('invoices')
@UseGuards(CompanyGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(
    @CurrentCompany() company: { id: string },
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoiceService.create(company.id, dto);
  }

  @Get()
  findAll(@CurrentCompany() company: { id: string }) {
    return this.invoiceService.findAllByCompany(company.id);
  }

  @Get('work-order/:workOrderId')
  findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    return this.invoiceService.findByWorkOrder(workOrderId);
  }

  @Post(':id/pay')
  markPaid(@Param('id') id: string) {
    return this.invoiceService.markPaid(id);
  }
}
