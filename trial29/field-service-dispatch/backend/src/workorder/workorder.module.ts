import { Module } from '@nestjs/common';
import { WorkOrderService } from './workorder.service';
import { WorkOrderController } from './workorder.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WorkOrderController],
  providers: [WorkOrderService, PrismaService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
