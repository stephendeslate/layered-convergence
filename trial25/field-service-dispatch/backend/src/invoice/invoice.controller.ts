import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string; companyId: string } }) {
    return this.invoiceService.findAll(req.user.id, req.user.companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.invoiceService.findOne(id, req.user.id, req.user.companyId);
  }

  @Post()
  async create(
    @Body()
    body: {
      amount: number;
      taxAmount: number;
      totalAmount: number;
      dueDate?: Date;
      customerId: string;
      workOrderId: string;
    },
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.invoiceService.create(body, req.user.id, req.user.companyId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.invoiceService.updateStatus(
      id,
      body.status as never,
      req.user.id,
      req.user.companyId,
    );
  }
}
