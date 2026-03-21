import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { ConnectedAccountModule } from './modules/connected-account/connected-account.module';
import { PayoutModule } from './modules/payout/payout.module';
import { WebhookLogModule } from './modules/webhook-log/webhook-log.module';
import { EscrowTimerModule } from './modules/escrow-timer/escrow-timer.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    TransactionModule,
    DisputeModule,
    ConnectedAccountModule,
    PayoutModule,
    WebhookLogModule,
    EscrowTimerModule,
  ],
})
export class AppModule {}
