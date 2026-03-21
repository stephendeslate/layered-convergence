import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { CompanyModule } from './company/company.module.js';
import { TechnicianModule } from './technician/technician.module.js';
import { CustomerModule } from './customer/customer.module.js';
import { WorkOrderModule } from './work-order/work-order.module.js';
import { RouteModule } from './route/route.module.js';
import { InvoiceModule } from './invoice/invoice.module.js';
import { GpsModule } from './gps/gps.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { CompanyContextMiddleware } from './common/middleware/company-context.middleware.js';
import { TechnicianController } from './technician/technician.controller.js';
import { CustomerController } from './customer/customer.controller.js';
import { WorkOrderController } from './work-order/work-order.controller.js';
import { InvoiceController } from './invoice/invoice.controller.js';

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
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompanyContextMiddleware)
      .forRoutes(
        TechnicianController,
        CustomerController,
        WorkOrderController,
        InvoiceController,
      );
  }
}
