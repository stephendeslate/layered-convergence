import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../../generated/prisma/client.js';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(
    @Body() body: { amount: number },
    @CurrentUser() user: User,
  ) {
    return this.payoutService.create(user.id, body.amount);
  }

  @Get()
  findByUser(@CurrentUser() user: User) {
    return this.payoutService.findByUser(user.id);
  }
}
