import { Module } from '@nestjs/common';
import { WorkOrderController } from './workorder.controller';
import { WorkOrderService } from './workorder.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WorkOrderController],
  providers: [WorkOrderService, PrismaService],
})
export class WorkOrderModule {}
