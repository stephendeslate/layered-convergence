// [TRACED:SA-003] Root module importing all feature modules
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { DataSourceModule } from './data-source/data-source.module';
import { DataPointModule } from './data-point/data-point.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { EmbedModule } from './embed/embed.module';
import { SyncRunModule } from './sync-run/sync-run.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TenantContextModule,
    DataSourceModule,
    DataPointModule,
    PipelineModule,
    DashboardModule,
    WidgetModule,
    EmbedModule,
    SyncRunModule,
  ],
})
export class AppModule {}
