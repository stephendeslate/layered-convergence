import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('transaction/:transactionId')
  async createPayout(
    @Param('transactionId') transactionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.payoutService.createPayout(transactionId, user);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.payoutService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.payoutService.findOne(id, user);
  }
}
