// TRACED:AE-HEALTH-CONTROLLER
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { MetricsService } from './metrics.service';
import { HealthResponse, ReadinessResponse, MetricsResponse } from '@analytics-engine/shared';

@Controller()
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
  ) {}

  @Get('health')
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: this.metrics.getUptime(),
      version: process.env.APP_VERSION ?? '0.1.0',
    };
  }

  @Get('health/ready')
  async getReadiness(): Promise<ReadinessResponse> {
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
  getMetrics(): MetricsResponse {
    return this.metrics.getMetrics();
  }
}
