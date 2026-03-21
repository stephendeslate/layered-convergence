import { Module } from '@nestjs/common';
import { WorkOrderService } from './work-order.service';
import { WorkOrderController } from './work-order.controller';
import { CompanyContextModule } from '../company-context/company-context.module';

@Module({
  imports: [CompanyContextModule],
  providers: [WorkOrderService],
  controllers: [WorkOrderController],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}
