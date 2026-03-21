import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  findByBuyer(@Query('buyerId') buyerId: string) {
    return this.transactionService.findAllByBuyer(buyerId);
  }

  @Get('seller')
  findBySeller(@Query('sellerId') sellerId: string) {
    return this.transactionService.findAllBySeller(sellerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      amount: number;
      currency: string;
      description: string;
      buyerId: string;
      sellerId: string;
    },
  ) {
    return this.transactionService.create(body);
  }

  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.transactionService.transitionStatus(id, status);
  }

  @Get('total')
  totalAmount(@Query('buyerId') buyerId: string) {
    return this.transactionService.totalAmountByBuyerRaw(buyerId);
  }
}
