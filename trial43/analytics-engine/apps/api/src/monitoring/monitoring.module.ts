import { Module } from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service';
import { RequestContextService } from './request-context.service';
import { MetricsService } from './metrics.service';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [HealthController],
  providers: [
    PinoLoggerService,
    RequestContextService,
    MetricsService,
    PrismaService,
  ],
  exports: [PinoLoggerService, RequestContextService, MetricsService],
})
export class MonitoringModule {}
