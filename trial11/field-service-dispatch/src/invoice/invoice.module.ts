import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { InvoiceController } from './invoice.controller.js';
import { WorkOrderModule } from '../work-order/work-order.module.js';

@Module({
  imports: [WorkOrderModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
