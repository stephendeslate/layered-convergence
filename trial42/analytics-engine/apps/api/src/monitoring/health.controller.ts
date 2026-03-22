import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Prisma } from '@prisma/client';
import { Public } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';
import { APP_VERSION } from '@analytics-engine/shared';

// TRACED:AE-MON-009
@Controller()
@SkipThrottle()
@Public()
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
  async getReady() {
    await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
