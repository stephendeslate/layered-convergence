import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WidgetModule } from './modules/widget/widget.module';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { DataPointModule } from './modules/data-point/data-point.module';
import { SyncRunModule } from './modules/sync-run/sync-run.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { QueryCacheModule } from './modules/query-cache/query-cache.module';
import { DeadLetterModule } from './modules/dead-letter/dead-letter.module';
import { EmbedModule } from './modules/embed/embed.module';
import { SseModule } from './modules/sse/sse.module';
import { ConnectorModule } from './modules/connector/connector.module';

@Module({
  imports: [
    PrismaModule,
    TenantModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    DataPointModule,
    SyncRunModule,
    AggregationModule,
    QueryCacheModule,
    DeadLetterModule,
    EmbedModule,
    SseModule,
    ConnectorModule,
  ],
})
export class AppModule {}
