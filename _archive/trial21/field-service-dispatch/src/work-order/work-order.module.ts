import { Module } from '@nestjs/common';
import { WorkOrderService } from './work-order.service.js';
import { WorkOrderController } from './work-order.controller.js';

@Module({
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
