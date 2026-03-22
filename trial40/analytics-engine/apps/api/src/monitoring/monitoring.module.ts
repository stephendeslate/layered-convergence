// TRACED:AE-MON-10 — Monitoring module aggregates logger, metrics, health, middleware
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PinoLoggerService } from './logger.provider';
import { MetricsService } from './metrics.service';
import { HealthController } from './health.controller';
import { CorrelationMiddleware } from './correlation.middleware';
import { RequestLoggerMiddleware } from './request-logger.middleware';

@Module({
  controllers: [HealthController],
  providers: [PinoLoggerService, MetricsService],
  exports: [PinoLoggerService, MetricsService],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationMiddleware, RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
