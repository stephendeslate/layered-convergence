import { Module } from '@nestjs/common';
import { DisputeService } from './dispute.service.js';
import { DisputeController } from './dispute.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { TransactionModule } from '../transaction/transaction.module.js';

@Module({
  imports: [AuthModule, TransactionModule],
  controllers: [DisputeController],
  providers: [DisputeService],
  exports: [DisputeService],
})
export class DisputeModule {}
