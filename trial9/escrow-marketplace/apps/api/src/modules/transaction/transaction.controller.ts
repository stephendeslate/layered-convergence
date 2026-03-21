import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, TransactionActionDto } from './transaction.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateTransactionDto) {
    return this.transactionService.create(userId, dto);
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
  findById(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  @Post(':id/release')
  release(@Param('id') id: string, @Body() dto: TransactionActionDto) {
    return this.transactionService.release(id, dto.reason);
  }

  @Post(':id/dispute')
  dispute(@Param('id') id: string, @Body() dto: TransactionActionDto) {
    return this.transactionService.dispute(id, dto.reason);
  }

  @Post(':id/refund')
  refund(@Param('id') id: string, @Body() dto: TransactionActionDto) {
    return this.transactionService.refund(id, dto.reason);
  }
}
