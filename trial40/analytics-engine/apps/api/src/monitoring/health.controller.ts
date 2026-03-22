// TRACED:AE-MON-09 — Health endpoints exempt from auth and rate limiting
// TRACED:AE-INFRA-02 — GET /health and GET /health/ready endpoints
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';
import { Prisma } from '@prisma/client';

@Controller()
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get('health')
  getHealth(): Record<string, unknown> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '0.1.0',
    };
  }

  @Get('health/ready')
  async getReadiness(): Promise<Record<string, unknown>> {
    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
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
  getMetrics(): Record<string, unknown> {
    const metrics = this.metricsService.getMetrics();
    return {
      ...metrics,
      timestamp: new Date().toISOString(),
    };
  }
}
