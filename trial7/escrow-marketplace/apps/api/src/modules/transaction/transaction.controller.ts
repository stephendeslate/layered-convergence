import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionTransactionDto } from './dto/transition-transaction.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@UserId() userId: string, @Body() dto: CreateTransactionDto) {
    return this.transactionService.create(userId, dto);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.transactionService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOneOrThrow(id);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionTransactionDto,
  ) {
    return this.transactionService.transition(id, dto);
  }
}
