// TRACED: FD-API-002 — Root application module
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { TechniciansModule } from './technicians/technicians.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule, WorkOrdersModule, TechniciansModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
