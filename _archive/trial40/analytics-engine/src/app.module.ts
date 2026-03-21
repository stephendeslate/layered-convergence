import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { WidgetsModule } from './widgets/widgets.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { DataSourceConfigsModule } from './data-source-configs/data-source-configs.module';
import { SyncRunsModule } from './sync-runs/sync-runs.module';
import { DataPointsModule } from './data-points/data-points.module';
import { EmbedConfigsModule } from './embed-configs/embed-configs.module';
import { QueryCacheModule } from './query-cache/query-cache.module';
import { DeadLetterEventsModule } from './dead-letter-events/dead-letter-events.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    DashboardsModule,
    WidgetsModule,
    DataSourcesModule,
    DataSourceConfigsModule,
    SyncRunsModule,
    DataPointsModule,
    EmbedConfigsModule,
    QueryCacheModule,
    DeadLetterEventsModule,
    PipelinesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
