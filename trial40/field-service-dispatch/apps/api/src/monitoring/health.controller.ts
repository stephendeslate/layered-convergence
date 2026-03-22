// TRACED: FD-MON-009 — Health and readiness endpoints exempt from auth and rate limiting
// TRACED: FD-MON-010 — Metrics endpoint returning in-memory operational stats
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';

const APP_VERSION = '1.0.0';

@Controller()
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  @Get('health/ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('metrics')
  getMetrics() {
    return this.metrics.getMetrics();
  }
}
