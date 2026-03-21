import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { PrismaService } from '../../config/prisma.service';
import { TechnicianModule } from '../technician/technician.module';
import { WorkOrderModule } from '../work-order/work-order.module';

@Module({
  imports: [TechnicianModule, WorkOrderModule],
  controllers: [DispatchController],
  providers: [DispatchService, PrismaService],
  exports: [DispatchService],
})
export class DispatchModule {}
