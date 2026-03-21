import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { DisputeModule } from './dispute/dispute.module';
import { PayoutModule } from './payout/payout.module';
import { WebhookModule } from './webhook/webhook.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';

// [TRACED:SA-001] NestJS modular architecture with domain-separated modules
// [TRACED:SA-004] Module dependency graph: Auth, Transaction, Dispute, Payout, Webhook
// [TRACED:SA-006] TenantContextModule provides RLS integration across all domain modules
@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    AuthModule,
    TransactionModule,
    DisputeModule,
    PayoutModule,
    WebhookModule,
  ],
})
export class AppModule {}
