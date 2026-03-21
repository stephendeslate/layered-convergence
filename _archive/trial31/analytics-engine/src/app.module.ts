import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { BullMqModule } from './bullmq/bullmq.module';
import { TenantModule } from './tenant/tenant.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { DataSourceModule } from './data-source/data-source.module';
import { DataSourceConfigModule } from './data-source-config/data-source-config.module';
import { SyncRunModule } from './sync-run/sync-run.module';
import { DataPointModule } from './data-point/data-point.module';
import { DeadLetterEventModule } from './dead-letter-event/dead-letter-event.module';
import { EmbedModule } from './embed/embed.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    BullMqModule,
    TenantModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    DataSourceConfigModule,
    SyncRunModule,
    DataPointModule,
    DeadLetterEventModule,
    EmbedModule,
    AnalyticsModule,
    IngestionModule,
    AuthModule,
  ],
})
export class AppModule {}
