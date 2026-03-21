import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { CompanyModule } from './modules/company/company.module';
import { TechnicianModule } from './modules/technician/technician.module';
import { CustomerModule } from './modules/customer/customer.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { RouteModule } from './modules/route/route.module';
import { JobPhotoModule } from './modules/job-photo/job-photo.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { GpsGatewayModule } from './modules/gps-gateway/gps-gateway.module';

@Module({
  imports: [
    CompanyModule,
    TechnicianModule,
    CustomerModule,
    WorkOrderModule,
    RouteModule,
    JobPhotoModule,
    InvoiceModule,
    DispatchModule,
    GpsGatewayModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
