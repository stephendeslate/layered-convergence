import { Module } from '@nestjs/common';
import { WebhookLogService } from './webhook-log.service';
import { WebhookLogController } from './webhook-log.controller';
import { PrismaService } from '../../config/prisma.service';
import { TransactionModule } from '../transaction/transaction.module';
import { PayoutModule } from '../payout/payout.module';
import { StripeAccountModule } from '../stripe-account/stripe-account.module';

@Module({
  imports: [TransactionModule, PayoutModule, StripeAccountModule],
  controllers: [WebhookLogController],
  providers: [WebhookLogService, PrismaService],
  exports: [WebhookLogService],
})
export class WebhookLogModule {}
