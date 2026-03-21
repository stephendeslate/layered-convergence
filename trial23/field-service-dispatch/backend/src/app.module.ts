// TRACED:NESTJS_MODULES — All 9 modules (auth, work-order, customer, technician, invoice, route, gps-event, company-context, prisma) exist

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { CustomerModule } from './customer/customer.module';
import { TechnicianModule } from './technician/technician.module';
import { InvoiceModule } from './invoice/invoice.module';
import { RouteModule } from './route/route.module';
import { GpsEventModule } from './gps-event/gps-event.module';
import { CompanyContextModule } from './company-context/company-context.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompanyContextModule,
    WorkOrderModule,
    CustomerModule,
    TechnicianModule,
    InvoiceModule,
    RouteModule,
    GpsEventModule,
  ],
})
export class AppModule {}
