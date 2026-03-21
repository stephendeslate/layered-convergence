import { Controller, Get, Post, Query } from '@nestjs/common';
import { EscrowTimerService } from './escrow-timer.service';

@Controller('admin/escrow-timer')
export class EscrowTimerController {
  constructor(private readonly escrowTimerService: EscrowTimerService) {}

  /** Admin endpoint: manually trigger processing of expired holds. */
  @Post('process')
  processExpired() {
    return this.escrowTimerService.processExpiredHolds();
  }

  /** Admin endpoint: view transactions expiring within the next N hours. */
  @Get('upcoming')
  getUpcoming(@Query('hours') hours?: string) {
    return this.escrowTimerService.getUpcomingExpirations(
      hours ? parseInt(hours, 10) : undefined,
    );
  }
}
