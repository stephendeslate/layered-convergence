import { Module } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { DisputeController } from './dispute.controller';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  providers: [DisputeService],
  controllers: [DisputeController],
  exports: [DisputeService],
})
export class DisputeModule {}
