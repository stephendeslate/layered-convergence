import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TransactionModule } from './transaction/transaction.module.js';
import { DisputeModule } from './dispute/dispute.module.js';
import { PayoutModule } from './payout/payout.module.js';
import { WebhookModule } from './webhook/webhook.module.js';
import { StripeAccountModule } from './stripe-account/stripe-account.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TransactionModule,
    DisputeModule,
    PayoutModule,
    WebhookModule,
    StripeAccountModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
