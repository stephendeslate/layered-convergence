import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [AuthModule, WorkOrderModule, InvoiceModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
