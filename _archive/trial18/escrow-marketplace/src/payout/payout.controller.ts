import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post(':transactionId')
  create(@Param('transactionId') transactionId: string) {
    return this.payoutService.createByTransactionId(transactionId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.payoutService.findByUser(userId);
  }
}
