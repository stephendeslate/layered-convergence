import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma';
import { RedisModule } from './redis';
import { BullMqModule } from './bullmq';
import { StripeModule } from './stripe';
import { AuthModule } from './auth';
import { AuditModule } from './audit';
import { WebhookModule } from './webhook';
import { HealthModule } from './health';
import { TransactionModule } from './transaction';
import { DisputeModule } from './dispute';
import { ProviderModule } from './provider';
import { PayoutModule } from './payout';
import { JobsModule } from './jobs';
import { NotificationModule } from './notification';
import { AnalyticsModule } from './analytics';
import { ReceiptModule } from './receipt';
import { AdminModule } from './admin';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    RedisModule,
    BullMqModule,
    StripeModule,
    AuthModule,
    AuditModule,
    NotificationModule, // Global — available to all modules
    TransactionModule,
    DisputeModule,
    ProviderModule,
    PayoutModule,
    JobsModule,
    WebhookModule,
    HealthModule,
    AnalyticsModule,
    ReceiptModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
