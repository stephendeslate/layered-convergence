import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PayoutQueryDto } from './dto/payout-query.dto';

@Controller('payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  findAll(@Query() query: PayoutQueryDto) {
    return this.payoutService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutService.findOne(id);
  }

  @Post(':id/complete')
  completePayout(@Param('id') id: string) {
    return this.payoutService.completePayout(id);
  }
}
