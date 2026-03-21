import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { TenantContextMiddleware } from './tenant-context/tenant-context.middleware';
import { DashboardsModule } from './dashboards/dashboards.module';
import { WidgetsModule } from './widgets/widgets.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AggregationModule } from './aggregation/aggregation.module';
import { QueryModule } from './query/query.module';
import { QueryCacheModule } from './cache/cache.module';
import { SseModule } from './sse/sse.module';
import { DeadLetterModule } from './dead-letter/dead-letter.module';
import { EmbedModule } from './embed/embed.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    PrismaModule,
    AuthModule,
    TenantContextModule,
    DashboardsModule,
    WidgetsModule,
    DataSourcesModule,
    ConnectorsModule,
    IngestionModule,
    AggregationModule,
    QueryModule,
    QueryCacheModule,
    SseModule,
    DeadLetterModule,
    EmbedModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
