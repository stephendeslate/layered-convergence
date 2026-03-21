import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './modules/company/company.module';
import { TechnicianModule } from './modules/technician/technician.module';
import { CustomerModule } from './modules/customer/customer.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { RouteModule } from './modules/route/route.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { GpsModule } from './modules/gps/gps.module';

@Module({
  imports: [
    PrismaModule,
    CompanyModule,
    TechnicianModule,
    CustomerModule,
    WorkOrderModule,
    RouteModule,
    InvoiceModule,
    GpsModule,
  ],
})
export class AppModule {}
