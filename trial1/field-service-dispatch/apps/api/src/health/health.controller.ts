import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { GpsGateway } from '../gateway/gps.gateway';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly gpsGateway: GpsGateway,
  ) {}

  @Public()
  @Get()
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('db')
  async healthDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', service: 'database' };
    } catch (err: any) {
      return { status: 'error', service: 'database', error: err.message };
    }
  }

  @Public()
  @Get('redis')
  async healthRedis() {
    const healthy = await this.redis.isHealthy();
    return {
      status: healthy ? 'ok' : 'error',
      service: 'redis',
    };
  }

  @Public()
  @Get('ws')
  async healthWs() {
    const healthy = this.gpsGateway.isHealthy();
    const connections = this.gpsGateway.getConnectionCount();
    return {
      status: healthy ? 'ok' : 'error',
      service: 'websocket',
      connections,
    };
  }
}
