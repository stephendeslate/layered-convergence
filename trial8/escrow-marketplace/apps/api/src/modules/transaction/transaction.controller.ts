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
import { TransitionTransactionDto } from './dto/transition-transaction.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(user.id, dto);
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

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionTransactionDto,
  ) {
    return this.transactionService.transition(id, dto.action, dto.reason);
  }
}
