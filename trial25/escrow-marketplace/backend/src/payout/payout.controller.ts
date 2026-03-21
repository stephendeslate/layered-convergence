import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PayoutService } from './payout.service';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.payoutService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { userId: string } }) {
    return this.payoutService.findOne(id, req.user.userId);
  }

  @Post()
  create(
    @Body() body: { transactionId: string; amount: number },
    @Request() req: { user: { userId: string } },
  ) {
    return this.payoutService.create({ ...body, recipientId: req.user.userId });
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: string; failureReason?: string },
    @Request() req: { user: { userId: string } },
  ) {
    return this.payoutService.transition(id, req.user.userId, body.status, body.failureReason);
  }
}
