import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, TransitionTransactionDto } from './transaction.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(userId, dto);
  }

  // Static routes before parameterized — per v3.0 Section 5.9
  @Get('analytics')
  async getAnalytics(@Headers('x-user-id') userId: string) {
    return this.transactionService.getAnalytics(userId);
  }

  @Get()
  async findByUser(@Headers('x-user-id') userId: string) {
    return this.transactionService.findByUser(userId);
  }

  @Get(':id')
  async findById(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.transactionService.findById(userId, id);
  }

  @Post(':id/transition')
  async transition(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() dto: TransitionTransactionDto,
  ) {
    return this.transactionService.transition(userId, id, dto);
  }
}
