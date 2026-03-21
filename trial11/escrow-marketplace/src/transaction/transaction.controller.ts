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
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../../generated/prisma/client.js';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto, @CurrentUser() user: User) {
    return this.transactionService.create(dto, user.id);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.transactionService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id/fund')
  async fund(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionService.fund(id, user);
  }

  @Patch(':id/deliver')
  async deliver(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionService.deliver(id, user);
  }

  @Patch(':id/release')
  async release(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionService.release(id, user);
  }

  @Patch(':id/dispute')
  async dispute(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.transactionService.dispute(id, user, dto.reason ?? 'No reason provided');
  }

  @Patch(':id/refund')
  async refund(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionService.refund(id, user);
  }
}
