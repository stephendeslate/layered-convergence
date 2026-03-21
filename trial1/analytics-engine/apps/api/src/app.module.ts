import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { BullmqModule } from './bullmq/bullmq.module';
import { AuthModule } from './auth/auth.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { DataSourceModule } from './data-source/data-source.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AggregationModule } from './aggregation/aggregation.module';
import { QueryModule } from './query/query.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { EmbedModule } from './embed/embed.module';
import { SseModule } from './sse/sse.module';
import { ThemeModule } from './theme/theme.module';
import { NotificationModule } from './notification/notification.module';
import { SyncModule } from './sync/sync.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { TenantModule } from './tenant/tenant.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    BullmqModule,
    AuthModule,
    TenantContextModule,
    AuditModule,
    HealthModule,
    ConnectorsModule,
    DataSourceModule,
    IngestionModule,
    AggregationModule,
    QueryModule,
    DashboardModule,
    WidgetModule,
    EmbedModule,
    SseModule,
    ThemeModule,
    NotificationModule,
    SyncModule,
    ApiKeyModule,
    TenantModule,
    CacheModule,
  ],
})
export class AppModule {}
