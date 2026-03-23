// TRACED: FD-APP-MODULE
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { validateEnvVars } from '@field-service-dispatch/shared';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { TechniciansModule } from './technicians/technicians.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ServiceAreasModule } from './service-areas/service-areas.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { GlobalExceptionFilter } from './monitoring/global-exception.filter';
import { ResponseTimeInterceptor } from './common/response-time.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CorrelationIdMiddleware } from './monitoring/correlation-id.middleware';
import { RequestLoggingMiddleware } from './monitoring/request-logging.middleware';

// TRACED: FD-ENV-VALIDATE-STARTUP
validateEnvVars(['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN']);

@Module({
  imports: [
    // TRACED: FD-THROTTLER-CONFIG
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    PrismaModule,
    AuthModule,
    MonitoringModule,
    WorkOrdersModule,
    TechniciansModule,
    SchedulesModule,
    ServiceAreasModule,
  ],
  providers: [
    // TRACED: FD-APP-FILTER-REGISTRATION
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // TRACED: FD-APP-INTERCEPTOR-REGISTRATION
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    // TRACED: FD-APP-GUARD-REGISTRATION
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
