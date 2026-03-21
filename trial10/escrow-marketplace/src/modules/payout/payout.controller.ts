import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('payouts')
@UseGuards(AuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(@Body() dto: CreatePayoutDto) {
    return this.payoutService.create(dto);
  }

  @Get()
  findAll() {
    return this.payoutService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.payoutService.findByUser(userId);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.payoutService.complete(id);
  }
}
