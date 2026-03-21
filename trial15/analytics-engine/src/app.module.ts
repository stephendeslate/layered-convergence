import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { TenantContextMiddleware } from './tenant-context/tenant-context.middleware';
import { DataSourceModule } from './data-source/data-source.module';
import { DataSourceConfigModule } from './data-source-config/data-source-config.module';
import { DataPointModule } from './data-point/data-point.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { SyncRunModule } from './sync-run/sync-run.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { EmbedModule } from './embed/embed.module';
import { QueryCacheModule } from './query-cache/query-cache.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TenantContextModule,
    DataSourceModule,
    DataSourceConfigModule,
    DataPointModule,
    PipelineModule,
    SyncRunModule,
    DashboardModule,
    WidgetModule,
    EmbedModule,
    QueryCacheModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
