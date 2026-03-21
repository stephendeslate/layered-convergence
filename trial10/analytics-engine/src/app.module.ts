import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WidgetModule } from './modules/widget/widget.module';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { ConnectorModule } from './modules/connector/connector.module';
import { SyncModule } from './modules/sync/sync.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { QueryCacheModule } from './modules/query-cache/query-cache.module';
import { DataPointModule } from './modules/data-point/data-point.module';
import { DeadLetterModule } from './modules/dead-letter/dead-letter.module';
import { EmbedModule } from './modules/embed/embed.module';
import { SseModule } from './modules/sse/sse.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TenantModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    ConnectorModule,
    SyncModule,
    AggregationModule,
    QueryCacheModule,
    DataPointModule,
    DeadLetterModule,
    EmbedModule,
    SseModule,
  ],
})
export class AppModule {}
