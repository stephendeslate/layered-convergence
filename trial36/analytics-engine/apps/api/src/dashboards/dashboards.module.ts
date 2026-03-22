import { Module } from '@nestjs/common';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { PrismaService } from '../prisma.service';

// TRACED: AE-API-002
@Module({
  controllers: [DashboardsController],
  providers: [DashboardsService, PrismaService],
})
export class DashboardsModule {}
