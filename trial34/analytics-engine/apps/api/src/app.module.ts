import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { PrismaService } from './prisma.service';

// TRACED: AE-FC-NEST-001 — NestJS AppModule with domain modules
@Module({
  imports: [AuthModule, DashboardModule, PipelineModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
