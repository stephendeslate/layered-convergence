import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionStateMachine } from './transaction-state-machine';
import { EscrowTimerProcessor } from './escrow-timer.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'escrow-timer' }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionStateMachine, EscrowTimerProcessor],
  exports: [TransactionsService, TransactionStateMachine],
})
export class TransactionsModule {}
