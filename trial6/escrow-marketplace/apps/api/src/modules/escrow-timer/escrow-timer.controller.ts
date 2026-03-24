import { Controller, Get, Post } from '@nestjs/common';
import { EscrowTimerService } from './escrow-timer.service';

/**
 * Admin endpoint for triggering and monitoring the escrow timer background service.
 * Addresses CED v6.0 Convention 5.18 — background service observability.
 */
@Controller('admin/escrow-timer')
export class EscrowTimerController {
  constructor(private readonly escrowTimerService: EscrowTimerService) {}

  @Post('run')
  triggerCheck() {
    return this.escrowTimerService.checkAndReleaseExpired();
  }

  @Get('status')
  getStatus() {
    return this.escrowTimerService.getStatus();
  }
}
