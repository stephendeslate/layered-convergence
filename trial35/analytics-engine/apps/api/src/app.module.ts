// TRACED: AE-API-002 — Root application module
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule, DashboardsModule, PipelinesModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
