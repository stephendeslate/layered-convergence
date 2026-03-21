import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { DisputeModule } from './dispute/dispute.module';
import { PayoutModule } from './payout/payout.module';
import { WebhookModule } from './webhook/webhook.module';
import { PrismaModule } from './prisma/prisma.module';

// TRACED:SA-001: Backend uses NestJS with modular architecture
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TransactionModule,
    DisputeModule,
    PayoutModule,
    WebhookModule,
  ],
})
export class AppModule {}
