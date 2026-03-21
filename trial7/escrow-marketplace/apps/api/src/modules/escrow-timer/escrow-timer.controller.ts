import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EscrowTimerService } from './escrow-timer.service';
import { AuthGuard } from '../../common/guards/auth.guard';

/**
 * Admin endpoints for the escrow timer background service.
 * Convention 5.18: background services must have admin endpoints.
 */
@Controller('admin/escrow-timer')
@UseGuards(AuthGuard)
export class EscrowTimerController {
  constructor(private readonly escrowTimerService: EscrowTimerService) {}

  @Post('process')
  processExpired() {
    return this.escrowTimerService.processExpiredHolds();
  }

  @Get('status')
  getStatus() {
    return this.escrowTimerService.getStatus();
  }
}
