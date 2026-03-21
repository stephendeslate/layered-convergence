import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UserId } from '../../common/decorators/user-id.decorator';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(@UserId() userId: string, @Body() dto: CreatePayoutDto) {
    return this.payoutService.create(userId, dto);
  }

  @Get()
  findMine(@UserId() userId: string) {
    return this.payoutService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutService.findOneOrThrow(id);
  }
}
