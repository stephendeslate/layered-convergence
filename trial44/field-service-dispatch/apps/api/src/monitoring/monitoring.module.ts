import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';

@Module({
  controllers: [HealthController, MetricsController],
  providers: [MetricsService, PinoLoggerService, RequestContextService],
  exports: [MetricsService, PinoLoggerService, RequestContextService],
})
export class MonitoringModule {}
