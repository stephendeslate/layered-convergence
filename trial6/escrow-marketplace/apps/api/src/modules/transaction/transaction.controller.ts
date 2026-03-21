import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, ReleaseTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.create(dto);
  }

  @Get()
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Post(':id/release')
  release(@Param('id') id: string, @Body() dto: ReleaseTransactionDto) {
    return this.transactionService.release(id, dto.reason);
  }

  @Post(':id/refund')
  refund(@Param('id') id: string, @Body() dto: ReleaseTransactionDto) {
    return this.transactionService.refund(id, dto.reason);
  }
}
