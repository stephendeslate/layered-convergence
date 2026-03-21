import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Controller('payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(@Body() dto: CreatePayoutDto) {
    return this.payoutService.create(dto);
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.payoutService.findByUser(userId);
  }

  @Get('summary/:userId')
  getPayoutSummary(@Param('userId') userId: string) {
    return this.payoutService.getPayoutSummary(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.payoutService.findById(id);
  }

  @Post(':id/process')
  processPayout(@Param('id') id: string) {
    return this.payoutService.processPayout(id);
  }
}
