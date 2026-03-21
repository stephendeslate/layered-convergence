import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransitionDto } from './dto/transition.dto.js';
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

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  @Get()
  findByUser(@CurrentUser() user: User) {
    return this.transactionService.findByUser(user.id);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionDto,
    @CurrentUser() user: User,
  ) {
    return this.transactionService.transition(id, dto.toState, user, dto.reason);
  }
}
