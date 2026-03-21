import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('transaction/:transactionId')
  createPayout(
    @CurrentUser() user: { id: string },
    @Param('transactionId') transactionId: string,
  ) {
    return this.payoutService.createPayout(user.id, transactionId);
  }

  @Get()
  findMine(@CurrentUser() user: { id: string }) {
    return this.payoutService.findByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutService.findOne(id);
  }
}
