// [TRACED:FD-SA-001] NestJS modules defined in app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { CustomerModule } from './customer/customer.module';
import { TechnicianModule } from './technician/technician.module';
import { RouteModule } from './route/route.module';
import { GpsEventModule } from './gps-event/gps-event.module';
import { InvoiceModule } from './invoice/invoice.module';
import { CompanyContextModule } from './company-context/company-context.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkOrderModule,
    CustomerModule,
    TechnicianModule,
    RouteModule,
    GpsEventModule,
    InvoiceModule,
    CompanyContextModule,
  ],
})
export class AppModule {}
