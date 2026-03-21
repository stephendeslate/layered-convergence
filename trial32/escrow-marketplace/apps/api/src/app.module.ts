// [TRACED:EM-SA-001] NestJS modules defined in app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionModule } from './transaction/transaction.module';
import { DisputeModule } from './dispute/dispute.module';
import { PayoutModule } from './payout/payout.module';
import { WebhookModule } from './webhook/webhook.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TransactionModule,
    DisputeModule,
    PayoutModule,
    WebhookModule,
    TenantContextModule,
  ],
})
export class AppModule {}
