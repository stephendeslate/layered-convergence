import { Module } from '@nestjs/common';
import { EscrowTimerService } from './escrow-timer.service';
import { EscrowTimerController } from './escrow-timer.controller';

@Module({
  controllers: [EscrowTimerController],
  providers: [EscrowTimerService],
  exports: [EscrowTimerService],
})
export class EscrowTimerModule {}
