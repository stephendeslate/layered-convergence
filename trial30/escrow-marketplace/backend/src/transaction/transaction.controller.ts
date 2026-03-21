import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  findAll(@Query('buyerId') buyerId: string) {
    return this.transactionService.findAllByBuyer(buyerId);
  }

  @Get('seller')
  findBySeller(@Query('sellerId') sellerId: string) {
    return this.transactionService.findAllBySeller(sellerId);
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.transactionService.transitionStatus(id, status);
  }
}
