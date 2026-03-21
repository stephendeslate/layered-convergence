import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get(':transactionId')
  async getReceipt(@Param('transactionId') transactionId: string) {
    return this.receiptService.generateReceipt(transactionId);
  }
}
