import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { StripeAccountModule } from './modules/stripe-account/stripe-account.module';
import { PayoutModule } from './modules/payout/payout.module';
import { WebhookLogModule } from './modules/webhook-log/webhook-log.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    UserModule,
    TransactionModule,
    DisputeModule,
    StripeAccountModule,
    PayoutModule,
    WebhookLogModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
