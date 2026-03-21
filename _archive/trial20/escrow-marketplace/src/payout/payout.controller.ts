import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() body: { transactionId: string; userId: string; amount: number }) {
    return this.payoutService.create(body);
  }

  @Get()
  findAll() {
    return this.payoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.payoutService.findByUser(userId);
  }
}
