import { Module } from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';
import { MetricsService } from './metrics.service';
import { HealthController } from './health.controller';
import { GlobalExceptionFilter } from './global-exception.filter';

// TRACED: FD-MONITORING-MODULE
@Module({
  controllers: [HealthController],
  providers: [
    PinoLoggerService,
    RequestContextService,
    MetricsService,
    GlobalExceptionFilter,
  ],
  exports: [
    PinoLoggerService,
    RequestContextService,
    MetricsService,
    GlobalExceptionFilter,
  ],
})
export class MonitoringModule {}
