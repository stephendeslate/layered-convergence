// TRACED: EM-HLTH-001
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from './metrics.service';
import { Prisma } from '@prisma/client';
import { APP_VERSION } from '@escrow-marketplace/shared';
import { Public } from '../auth/public.decorator';

@Controller()
@SkipThrottle()
@Public()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: APP_VERSION,
    };
  }

  // TRACED: EM-HLTH-002
  @Get('health/ready')
  async ready() {
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

  // TRACED: EM-METR-002
  @Get('metrics')
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
