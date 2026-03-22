// TRACED: EM-MON-005 — Monitoring module with health, metrics, and middleware
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MetricsService } from './metrics.service';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { RequestLoggerMiddleware } from './request-logger.middleware';
import { AppLoggerService } from './app-logger.service';

@Module({
  controllers: [HealthController],
  providers: [MetricsService, AppLoggerService],
  exports: [MetricsService, AppLoggerService],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
