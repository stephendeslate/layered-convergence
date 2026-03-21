import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './modules/company/company.module';
import { TechnicianModule } from './modules/technician/technician.module';
import { CustomerModule } from './modules/customer/customer.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { RouteModule } from './modules/route/route.module';
import { JobPhotoModule } from './modules/job-photo/job-photo.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { GpsGatewayModule } from './modules/gps-gateway/gps-gateway.module';

@Module({
  imports: [
    PrismaModule,
    CompanyModule,
    TechnicianModule,
    CustomerModule,
    WorkOrderModule,
    RouteModule,
    JobPhotoModule,
    InvoiceModule,
    DispatchModule,
    TrackingModule,
    GpsGatewayModule,
  ],
})
export class AppModule {}
