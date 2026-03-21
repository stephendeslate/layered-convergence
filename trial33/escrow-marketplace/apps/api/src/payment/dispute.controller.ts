import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DisputeService } from './dispute.service';
import { DISPUTE_STATUSES } from '@escrow-marketplace/shared';
import type { DisputeStatus } from '@escrow-marketplace/shared';

// TRACED: EM-API-DISP-LIST-001 — Dispute endpoints with JWT guard
@Controller('disputes')
@UseGuards(AuthGuard('jwt'))
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Get('transaction/:txId')
  findByTransaction(@Param('txId') txId: string) {
    return this.disputeService.findByTransaction(txId);
  }

  @Patch(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: DisputeStatus },
  ) {
    return this.disputeService.transition(id, body.status);
  }
}
