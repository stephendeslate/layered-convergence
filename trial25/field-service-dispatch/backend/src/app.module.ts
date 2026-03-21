import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { TechnicianModule } from './technician/technician.module';
import { RouteModule } from './route/route.module';
import { InvoiceModule } from './invoice/invoice.module';
import { CustomerModule } from './customer/customer.module';
import { GpsEventModule } from './gps-event/gps-event.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkOrderModule,
    TechnicianModule,
    RouteModule,
    InvoiceModule,
    CustomerModule,
    GpsEventModule,
  ],
})
export class AppModule {}
