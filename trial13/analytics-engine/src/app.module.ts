import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { AuthModule } from './auth/auth.module';
import { DataSourceModule } from './data-source/data-source.module';
import { DataSourceConfigModule } from './data-source-config/data-source-config.module';
import { SyncRunModule } from './sync-run/sync-run.module';
import { DataPointModule } from './data-point/data-point.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WidgetModule } from './widget/widget.module';
import { EmbedModule } from './embed/embed.module';
import { QueryCacheModule } from './query-cache/query-cache.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    AuthModule,
    DataSourceModule,
    DataSourceConfigModule,
    SyncRunModule,
    DataPointModule,
    PipelineModule,
    DashboardModule,
    WidgetModule,
    EmbedModule,
    QueryCacheModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
