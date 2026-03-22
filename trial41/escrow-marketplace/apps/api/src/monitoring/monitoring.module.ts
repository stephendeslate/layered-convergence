// TRACED:EM-MON-10 monitoring module exporting RequestContextService
import { Module } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { LoggerService } from './logger.service';
import { MetricsService } from './metrics.service';
import { HealthController } from './health.controller';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [HealthController, MetricsController],
  providers: [RequestContextService, LoggerService, MetricsService],
  exports: [RequestContextService, LoggerService, MetricsService],
})
export class MonitoringModule {}
