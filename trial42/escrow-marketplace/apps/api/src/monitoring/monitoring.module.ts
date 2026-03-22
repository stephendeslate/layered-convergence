// TRACED: EM-MMOD-001
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MetricsService } from './metrics.service';
import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { RequestLoggingMiddleware } from './request-logging.middleware';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ResponseTimeInterceptor } from './response-time.interceptor';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [HealthController],
  providers: [
    MetricsService,
    LoggerService,
    RequestContextService,
    GlobalExceptionFilter,
    ResponseTimeInterceptor,
    PrismaService,
  ],
  exports: [
    MetricsService,
    LoggerService,
    RequestContextService,
    GlobalExceptionFilter,
    ResponseTimeInterceptor,
  ],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
