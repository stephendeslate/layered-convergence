import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { TechnicianModule } from '../technician/technician.module';
import { WorkOrderModule } from '../work-order/work-order.module';

@Module({
  imports: [TechnicianModule, WorkOrderModule],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
