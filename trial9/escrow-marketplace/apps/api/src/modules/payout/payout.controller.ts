import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post('transaction/:transactionId')
  createPayout(@Param('transactionId') transactionId: string) {
    return this.payoutService.createPayout(transactionId);
  }

  @Get('me')
  findMyPayouts(@CurrentUserId() userId: string) {
    return this.payoutService.findByUser(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.payoutService.findById(id);
  }

  @Post(':id/complete')
  completePayout(@Param('id') id: string) {
    return this.payoutService.completePayout(id);
  }
}
