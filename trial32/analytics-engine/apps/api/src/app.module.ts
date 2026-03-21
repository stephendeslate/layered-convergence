// [TRACED:AE-SA-001] NestJS modules defined in app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataSourceModule } from './data-source/data-source.module';
import { DataPointModule } from './data-point/data-point.module';
import { WidgetModule } from './widget/widget.module';
import { EmbedModule } from './embed/embed.module';
import { SyncRunModule } from './sync-run/sync-run.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PipelineModule,
    DashboardModule,
    DataSourceModule,
    DataPointModule,
    WidgetModule,
    EmbedModule,
    SyncRunModule,
    TenantContextModule,
  ],
})
export class AppModule {}
