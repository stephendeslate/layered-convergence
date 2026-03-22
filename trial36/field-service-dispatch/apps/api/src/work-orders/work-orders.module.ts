// TRACED: FD-WO-001 — Work orders module
import { Module } from '@nestjs/common';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService, PrismaService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
