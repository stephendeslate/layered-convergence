import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { StripeConnectModule } from './modules/stripe-connect/stripe-connect.module';
import { PayoutModule } from './modules/payout/payout.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    TransactionModule,
    DisputeModule,
    StripeConnectModule,
    PayoutModule,
    WebhookModule,
    NotificationModule,
  ],
})
export class AppModule {}
