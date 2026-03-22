// TRACED: FD-API-002 — Root application module with ThrottlerGuard, ResponseTimeInterceptor, and monitoring
// TRACED: FD-SEC-002 — Rate limiting via ThrottlerModule registered as APP_GUARD
// TRACED: FD-PERF-003 — ResponseTimeInterceptor registered as APP_INTERCEPTOR
// TRACED: FD-MON-004 — Monitoring module integrated into AppModule
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { AuthModule } from './auth/auth.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { TechniciansModule } from './technicians/technicians.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ServiceAreasModule } from './service-areas/service-areas.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './prisma/prisma.module';
import { CorrelationMiddleware } from './monitoring/correlation.middleware';
import { RequestLoggerMiddleware } from './monitoring/request-logger.middleware';
import { GlobalExceptionFilter } from './monitoring/global-exception.filter';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level(label: string) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    PrismaModule,
    AuthModule,
    WorkOrdersModule,
    TechniciansModule,
    SchedulesModule,
    ServiceAreasModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: 'LOGGER',
      useValue: logger,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
