import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionTransactionDto } from './dto/transition-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.create(dto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('role') role?: 'buyer' | 'provider',
  ) {
    return this.transactionService.findAll(userId, role);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.transactionService.getTimeline(id);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionTransactionDto,
  ) {
    return this.transactionService.transition(id, dto);
  }
}
