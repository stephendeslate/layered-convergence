import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantContextMiddleware } from './tenant-context/tenant-context.middleware';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { DataSourceModule } from './data-source/data-source.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { EmbedModule } from './embed/embed.module';
import { DataPointModule } from './data-point/data-point.module';
import { SyncRunModule } from './sync-run/sync-run.module';
import { QueryCacheModule } from './query-cache/query-cache.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TenantContextModule,
    DataSourceModule,
    DashboardModule,
    WidgetModule,
    PipelineModule,
    EmbedModule,
    DataPointModule,
    SyncRunModule,
    QueryCacheModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude('auth/(.*)')
      .forRoutes('*');
  }
}
