import {
  Controller,
  Get,
  Param,
  Headers,
} from '@nestjs/common';
import { PayoutService } from './payout.service';

@Controller('payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  // Static route before parameterized — per v3.0 Section 5.9
  @Get('summary')
  async getPayoutSummary(@Headers('x-user-id') userId: string) {
    return this.payoutService.getPayoutSummary(userId);
  }

  @Get()
  async findByProvider(@Headers('x-user-id') userId: string) {
    return this.payoutService.findByProvider(userId);
  }

  @Get(':id')
  async findById(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.payoutService.findById(userId, id);
  }
}
