import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  health() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('db')
  async dbHealth() {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', latency: Date.now() - start };
  }
}
