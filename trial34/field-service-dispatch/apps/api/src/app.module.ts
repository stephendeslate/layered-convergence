import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WorkOrderModule } from './workorder/workorder.module';
import { TechnicianModule } from './technician/technician.module';
import { PrismaService } from './prisma.service';

// TRACED: FD-FC-NEST-001 — NestJS AppModule with domain modules
@Module({
  imports: [AuthModule, WorkOrderModule, TechnicianModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
