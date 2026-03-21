import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { StripeService } from '../stripe/stripe.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly stripe: StripeService,
  ) {}

  @Get()
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('db')
  async healthDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', service: 'database' };
    } catch (error) {
      return {
        status: 'error',
        service: 'database',
        message: (error as Error).message,
      };
    }
  }

  @Get('redis')
  async healthRedis() {
    const healthy = await this.redis.isHealthy();
    return {
      status: healthy ? 'ok' : 'error',
      service: 'redis',
    };
  }

  @Get('stripe')
  async healthStripe() {
    const healthy = await this.stripe.isHealthy();
    return {
      status: healthy ? 'ok' : 'error',
      service: 'stripe',
      mode: this.stripe.isMockMode ? 'mock' : 'live',
    };
  }
}
