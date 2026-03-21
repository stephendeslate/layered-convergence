import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WidgetModule } from './modules/widget/widget.module';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { ConnectorModule } from './modules/connector/connector.module';
import { SyncModule } from './modules/sync/sync.module';
import { DataPointModule } from './modules/data-point/data-point.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { QueryCacheModule } from './modules/query-cache/query-cache.module';
import { EmbedModule } from './modules/embed/embed.module';
import { ThemeModule } from './modules/theme/theme.module';
import { WebhookIngestModule } from './modules/webhook-ingest/webhook-ingest.module';
import { DeadLetterModule } from './modules/dead-letter/dead-letter.module';
import { SseModule } from './modules/sse/sse.module';

@Module({
  imports: [
    AuthModule,
    TenantModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    ConnectorModule,
    SyncModule,
    DataPointModule,
    AggregationModule,
    QueryCacheModule,
    EmbedModule,
    ThemeModule,
    WebhookIngestModule,
    DeadLetterModule,
    SseModule,
  ],
})
export class AppModule {}
