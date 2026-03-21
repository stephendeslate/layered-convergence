import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantContextMiddleware } from './tenant-context/tenant-context.middleware';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataSourceModule } from './data-source/data-source.module';
import { DataPointModule } from './data-point/data-point.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { WidgetModule } from './widget/widget.module';
import { EmbedModule } from './embed/embed.module';
import { SyncRunModule } from './sync-run/sync-run.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TenantContextModule,
    DashboardModule,
    DataSourceModule,
    DataPointModule,
    PipelineModule,
    WidgetModule,
    EmbedModule,
    SyncRunModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude('auth/(.*)', 'embeds/public/(.*)')
      .forRoutes('*');
  }
}
