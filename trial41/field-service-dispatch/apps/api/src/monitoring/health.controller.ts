import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';
import { APP_VERSION } from '@field-service-dispatch/shared';
import { Prisma } from '@prisma/client';
import { Public } from '../common/public.decorator';

// TRACED: FD-HEALTH-ENDPOINT
@Controller()
@Public()
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  @Get('health/ready')
  async getReadiness() {
    await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }

  @Get('metrics')
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
