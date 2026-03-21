import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db')
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'database',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'database',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('redis')
  async checkRedis() {
    try {
      const healthy = await this.redis.isHealthy();
      return {
        status: healthy ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'redis',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'redis',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
