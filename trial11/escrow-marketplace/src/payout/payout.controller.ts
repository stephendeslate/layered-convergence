import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PayoutService } from './payout.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../../generated/prisma/client.js';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  async listPayouts(@CurrentUser() user: User) {
    return this.payoutService.listPayouts(user.id);
  }

  @Post(':transactionId')
  async createPayout(
    @Param('transactionId') transactionId: string,
    @CurrentUser() user: User,
  ) {
    return this.payoutService.createPayout(transactionId, user.id);
  }
}
