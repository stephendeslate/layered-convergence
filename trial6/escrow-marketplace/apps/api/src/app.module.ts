import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { StripeConnectModule } from './modules/stripe-connect/stripe-connect.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { PayoutModule } from './modules/payout/payout.module';
import { EscrowTimerModule } from './modules/escrow-timer/escrow-timer.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationModule } from './modules/notification/notification.module';
import { WebhookLogModule } from './modules/webhook-log/webhook-log.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TransactionModule,
    DisputeModule,
    StripeConnectModule,
    WebhookModule,
    PayoutModule,
    EscrowTimerModule,
    AnalyticsModule,
    NotificationModule,
    WebhookLogModule,
  ],
})
export class AppModule {}
