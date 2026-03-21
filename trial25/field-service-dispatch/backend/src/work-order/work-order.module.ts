import { Module } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { WorkOrderController } from './work-order.controller';
import { TenantContextModule } from '../tenant/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  controllers: [WorkOrderController],
  providers: [WorkOrderService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
