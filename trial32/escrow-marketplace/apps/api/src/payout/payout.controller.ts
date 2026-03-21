import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Post()
  create(
    @Request() req: { user: { tenantId: string } },
    @Body() body: { amount: number; currency: string; recipientId: string; transactionId: string },
  ) {
    return this.payoutService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Get()
  findAll(@Request() req: { user: { tenantId: string } }) {
    return this.payoutService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.payoutService.findOne(id, req.user.tenantId);
  }

  @Post(':id/process')
  markProcessed(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.payoutService.markProcessed(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { tenantId: string } }) {
    return this.payoutService.remove(id, req.user.tenantId);
  }
}
