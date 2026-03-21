import { Module } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { WorkOrderController } from './work-order.controller';

@Module({
  providers: [WorkOrderService],
  controllers: [WorkOrderController],
})
export class WorkOrderModule {}
