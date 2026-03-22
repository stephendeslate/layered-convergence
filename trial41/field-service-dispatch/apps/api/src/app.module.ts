import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { TechnicianModule } from './technician/technician.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ServiceAreaModule } from './service-area/service-area.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { GlobalExceptionFilter } from './monitoring/global-exception.filter';
import { CorrelationIdMiddleware } from './monitoring/correlation-id.middleware';
import { RequestLoggingMiddleware } from './monitoring/request-logging.middleware';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
// TRACED: FD-APP-MODULE
import { validateEnvVars } from '@field-service-dispatch/shared';

// Validate required env vars at startup
if (process.env.NODE_ENV !== 'test') {
  validateEnvVars([
    'DATABASE_URL',
    'JWT_SECRET',
    'CORS_ORIGIN',
  ]);
}

@Module({
  imports: [
    // TRACED: FD-THROTTLER-CONFIG
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    MonitoringModule,
    WorkOrderModule,
    TechnicianModule,
    ScheduleModule,
    ServiceAreaModule,
  ],
  providers: [
    // TRACED: FD-APP-INTERCEPTOR
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    // TRACED: FD-APP-FILTER (FM#94 fix: registered via DI, NOT main.ts)
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // TRACED: FD-APP-GUARD-THROTTLER
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
