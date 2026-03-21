import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WidgetModule } from './modules/widget/widget.module';
import { DataSourceModule } from './modules/data-source/data-source.module';
import { DataPointModule } from './modules/data-point/data-point.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { AggregationModule } from './modules/aggregation/aggregation.module';
import { SyncRunModule } from './modules/sync-run/sync-run.module';

@Module({
  imports: [
    PrismaModule,
    TenantModule,
    DashboardModule,
    WidgetModule,
    DataSourceModule,
    DataPointModule,
    IngestionModule,
    AggregationModule,
    SyncRunModule,
  ],
})
export class AppModule {}
