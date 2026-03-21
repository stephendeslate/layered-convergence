import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module.js';
import { TenantModule } from './tenant/tenant.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { WidgetModule } from './widget/widget.module.js';
import { DataSourceModule } from './data-source/data-source.module.js';
import { PipelineModule } from './pipeline/pipeline.module.js';
import { DataPointModule } from './data-point/data-point.module.js';
import { WebhookIngestModule } from './webhook-ingest/webhook-ingest.module.js';
import { EmbedModule } from './embed/embed.module.js';
import { SseModule } from './sse/sse.module.js';
import { QueryCacheModule } from './query-cache/query-cache.module.js';
import { TenantContextMiddleware } from './tenant/tenant-context.middleware.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6380', 10),
      },
    }),
    BullModule.registerQueue({ name: 'sync' }),
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
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude(
        { path: 'tenants', method: RequestMethod.POST },
        { path: 'tenants/(.*)', method: RequestMethod.ALL },
        { path: 'ingest/(.*)', method: RequestMethod.ALL },
        { path: 'embed/(.*)', method: RequestMethod.ALL },
        { path: 'embed-configs', method: RequestMethod.ALL },
        { path: 'sse/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
