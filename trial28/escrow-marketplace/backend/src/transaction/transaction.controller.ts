import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async findAll() {
    return this.transactionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  @Patch(':id/release')
  async release(@Param('id') id: string) {
    return this.transactionService.releaseTransaction(id);
  }

  @Patch(':id/status')
  async transition(
    @Param('id') id: string,
    @Query('status') status: string,
  ) {
    return this.transactionService.transitionStatus(id, status);
  }

  @Get('sum/:status')
  async sum(@Param('status') status: string) {
    const total = await this.transactionService.sumByStatus(status);
    return { total };
  }
}
