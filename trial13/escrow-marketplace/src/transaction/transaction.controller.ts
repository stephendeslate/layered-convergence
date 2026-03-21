import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { DisputeReasonDto } from './dto/dispute-reason.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../../generated/prisma/client.js';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.transactionService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.transactionService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  @Patch(':id/fund')
  fund(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionService.fund(id, user);
  }

  @Patch(':id/deliver')
  deliver(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionService.deliver(id, user);
  }

  @Patch(':id/release')
  release(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionService.release(id, user);
  }

  @Patch(':id/dispute')
  dispute(
    @Param('id') id: string,
    @Body() body: DisputeReasonDto | undefined,
    @CurrentUser() user: User,
  ) {
    return this.transactionService.dispute(id, user, body?.reason);
  }

  @Patch(':id/refund')
  refund(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionService.refund(id, user);
  }
}
