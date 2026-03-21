import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { PayoutModule } from './modules/payout/payout.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { WebhookLogModule } from './modules/webhook-log/webhook-log.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    TransactionModule,
    DisputeModule,
    PayoutModule,
    StripeModule,
    WebhookLogModule,
  ],
})
export class AppModule {}
