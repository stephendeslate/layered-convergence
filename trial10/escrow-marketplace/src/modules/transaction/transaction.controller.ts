import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.create(dto);
  }

  @Get()
  findAll(
    @Query('buyerId') buyerId?: string,
    @Query('providerId') providerId?: string,
    @Query('status') status?: string,
  ) {
    return this.transactionService.findAll({ buyerId, providerId, status });
  }

  @Get('analytics')
  getAnalytics() {
    return this.transactionService.getAnalytics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Post(':id/hold')
  hold(@Param('id') id: string) {
    return this.transactionService.hold(id);
  }

  @Post(':id/release')
  release(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.transactionService.release(id, reason);
  }

  @Post(':id/refund')
  refund(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.transactionService.refund(id, reason);
  }
}
