import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { TenantModule } from './tenant/tenant.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { WidgetModule } from './widget/widget.module.js';
import { DataSourceModule } from './datasource/datasource.module.js';
import { PipelineModule } from './pipeline/pipeline.module.js';
import { DataPointModule } from './datapoint/datapoint.module.js';
import { WebhookIngestModule } from './webhook-ingest/webhook-ingest.module.js';
import { EmbedModule } from './embed/embed.module.js';
import { SseModule } from './sse/sse.module.js';
import { QueryCacheModule } from './query-cache/query-cache.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware.js';

@Module({
  imports: [
    PrismaModule,
    TenantModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    PipelineModule,
    DataPointModule,
    WebhookIngestModule,
    EmbedModule,
    SseModule,
    QueryCacheModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude(
        'tenants/(.*)',
        'tenants',
        'ingest/(.*)',
        'embed/(.*)',
        'query-cache/(.*)',
        'query-cache',
        'sse/(.*)',
      )
      .forRoutes('*');
  }
}
