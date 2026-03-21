import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyContextModule } from './company-context/company-context.module';
import { CustomerModule } from './customer/customer.module';
import { TechnicianModule } from './technician/technician.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { RouteModule } from './route/route.module';
import { GpsEventModule } from './gps-event/gps-event.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompanyContextModule,
    CustomerModule,
    TechnicianModule,
    WorkOrderModule,
    RouteModule,
    GpsEventModule,
    InvoiceModule,
  ],
})
export class AppModule {}
