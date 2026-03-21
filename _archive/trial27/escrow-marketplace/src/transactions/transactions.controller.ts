import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionTransactionDto } from './dto/transition-transaction.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { TransactionStatus, UserRole } from '@prisma/client';

@Controller('transactions')
@UseGuards(AuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(UserRole.BUYER)
  create(@Body() dto: CreateTransactionDto, @CurrentUser() user: RequestUser) {
    return this.transactionsService.create(dto, user.sub, user.tenantId);
  }

  @Get()
  findAll(
    @CurrentUser() user: RequestUser,
    @Query('status') status?: TransactionStatus,
  ) {
    const filters: any = {};
    if (status) filters.status = status;

    if (user.role === UserRole.BUYER) {
      filters.buyerId = user.sub;
    } else if (user.role === UserRole.PROVIDER) {
      filters.providerId = user.sub;
    }

    return this.transactionsService.findAll(user.tenantId, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.transactionsService.findById(id, user.tenantId);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionTransactionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.transactionsService.transition(id, dto, user.sub, user.tenantId);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.transactionsService.getStateHistory(id, user.tenantId);
  }
}
