import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto, TransactionQueryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Roles('BUYER')
  async createTransaction(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.createTransaction(
      user.id,
      dto.providerId,
      dto.amount,
      dto.description,
    );
  }

  @Get()
  async listTransactions(
    @CurrentUser() user: CurrentUserData,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionService.listTransactions(
      user.id,
      user.role,
      query.page,
      query.limit,
      query.status,
    );
  }

  @Get(':id')
  async getTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.transactionService.getTransactionDetail(id);
  }

  @Post(':id/deliver')
  @Roles('PROVIDER')
  @HttpCode(HttpStatus.OK)
  async markDelivery(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.transactionService.markDelivery(id, user.id);
  }

  @Post(':id/confirm')
  @Roles('BUYER')
  @HttpCode(HttpStatus.OK)
  async confirmDelivery(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.transactionService.confirmDelivery(id, user.id);
  }

  @Post(':id/release')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async releasePayment(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.transactionService.releasePayment(id, user.id);
  }

  @Post(':id/refund')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async refundTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.transactionService.refundTransaction(id, user.id, reason);
  }

  @Post(':id/cancel')
  @Roles('BUYER')
  @HttpCode(HttpStatus.OK)
  async cancelTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.transactionService.cancelTransaction(id, user.id);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.transactionService.getTransactionHistory(id);
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string) {
    return this.transactionService.getTimeline(id);
  }
}
