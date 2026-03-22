// TRACED: EM-MON-006 — Health endpoints exempt from auth and rate limiting
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';

@Controller('health')
@SkipThrottle()
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.APP_VERSION || '1.0.0',
    };
  }

  @Get('ready')
  async ready() {
    const dbHealthy = await this.prisma.checkDatabaseHealth();
    return {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  }

  @Get('/metrics')
  metrics() {
    return this.metricsService.getMetrics();
  }
}
