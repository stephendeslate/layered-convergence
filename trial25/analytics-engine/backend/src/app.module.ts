import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantContextModule } from './tenant/tenant-context.module';
import { DataSourceModule } from './data-source/data-source.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SyncRunModule } from './sync-run/sync-run.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantContextModule,
    DataSourceModule,
    PipelineModule,
    DashboardModule,
    SyncRunModule,
  ],
})
export class AppModule {}
