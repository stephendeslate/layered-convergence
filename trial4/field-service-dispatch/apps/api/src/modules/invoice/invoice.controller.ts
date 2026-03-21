import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './invoice.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(
    @Headers('x-company-id') companyId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoiceService.create(companyId, dto);
  }

  @Get()
  async findByCompany(@Headers('x-company-id') companyId: string) {
    return this.invoiceService.findByCompany(companyId);
  }

  @Get(':id')
  async findById(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ) {
    return this.invoiceService.findById(companyId, id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return this.invoiceService.updateStatus(companyId, id, dto);
  }
}
