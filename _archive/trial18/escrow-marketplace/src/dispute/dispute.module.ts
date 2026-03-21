import { Module } from '@nestjs/common';
import { DisputeController } from './dispute.controller.js';
import { DisputeService } from './dispute.service.js';
import { TransactionModule } from '../transaction/transaction.module.js';

@Module({
  imports: [TransactionModule],
  controllers: [DisputeController],
  providers: [DisputeService],
})
export class DisputeModule {}
