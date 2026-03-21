import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { StripeConnectModule } from './modules/stripe-connect/stripe-connect.module';
import { PayoutModule } from './modules/payout/payout.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    TransactionModule,
    DisputeModule,
    StripeConnectModule,
    PayoutModule,
    WebhookModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
