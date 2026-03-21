import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TenantModule } from './modules/tenant/tenant.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WidgetModule } from './modules/widget/widget.module';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { DataPointModule } from './modules/data-point/data-point.module';
import { SyncRunModule } from './modules/sync-run/sync-run.module';
import { DeadLetterModule } from './modules/dead-letter/dead-letter.module';
import { EmbedConfigModule } from './modules/embed-config/embed-config.module';
import { QueryCacheModule } from './modules/query-cache/query-cache.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { ConnectorModule } from './modules/connector/connector.module';
import { SseModule } from './modules/sse/sse.module';

@Module({
  imports: [
    TenantModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    DataPointModule,
    SyncRunModule,
    DeadLetterModule,
    EmbedConfigModule,
    QueryCacheModule,
    AggregationModule,
    ConnectorModule,
    SseModule,
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
