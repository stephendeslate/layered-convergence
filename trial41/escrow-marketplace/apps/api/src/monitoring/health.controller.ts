// TRACED:EM-MON-08 health endpoints exempt from auth and rate limiting
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
@SkipThrottle()
@Public()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
    };
  }

  @Get('ready')
  async getReadiness() {
    await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    };
  }
}
