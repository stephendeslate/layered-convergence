import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async findAll(@Query('userId') userId: string) {
    return this.transactionService.findAllByUser(userId);
  }

  @Get('total')
  async total(@Query('userId') userId: string) {
    const total = await this.transactionService.totalByUserRaw(userId);
    return { total };
  }

  @Patch(':id/status')
  async transition(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.transactionService.transitionStatus(id, status);
  }

  @Patch(':id/fund')
  async fund(@Param('id') id: string) {
    return this.transactionService.fundTransaction(id);
  }
}
