import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { WorkOrderModule } from '../work-order/work-order.module';
import { RoutingModule } from '../routing/routing.module';

@Module({
  imports: [WorkOrderModule, RoutingModule],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
