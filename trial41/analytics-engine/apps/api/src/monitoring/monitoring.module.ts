// TRACED:AE-MONITORING-MODULE
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HealthController } from './health.controller';
import { PinoLoggerService } from './pino-logger.service';
import { MetricsService } from './metrics.service';
import { RequestContextService } from './request-context.service';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { RequestLoggingMiddleware } from './request-logging.middleware';

@Module({
  controllers: [HealthController],
  providers: [
    PrismaService,
    PinoLoggerService,
    MetricsService,
    RequestContextService,
  ],
  exports: [PinoLoggerService, MetricsService, RequestContextService],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
