import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { EventsModule } from './events/events.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { GlobalExceptionFilter } from './monitoring/global-exception.filter';
import { CorrelationIdMiddleware } from './monitoring/correlation-id.middleware';
import { RequestLoggingMiddleware } from './monitoring/request-logging.middleware';
import { ResponseTimeInterceptor } from './monitoring/response-time.interceptor';

// TRACED:AE-ARCH-001
@Module({
  imports: [
    // TRACED:AE-SEC-009
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    AuthModule,
    DashboardsModule,
    DataSourcesModule,
    EventsModule,
    PipelinesModule,
    MonitoringModule,
  ],
  providers: [
    // TRACED:AE-SEC-010
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // TRACED:AE-CROSS-004
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // TRACED:AE-MON-014
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // TRACED:AE-PERF-003
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
