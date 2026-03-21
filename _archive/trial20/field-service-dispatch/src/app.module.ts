import { Module, NestModule, MiddlewareConsumer, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { CompanyModule } from './company/company.module.js';
import { TechnicianModule } from './technician/technician.module.js';
import { CustomerModule } from './customer/customer.module.js';
import { WorkOrderModule } from './work-order/work-order.module.js';
import { RouteModule } from './route/route.module.js';
import { InvoiceModule } from './invoice/invoice.module.js';
import { GpsModule } from './gps/gps.module.js';
import { CompanyContextMiddleware } from './company/company-context.middleware.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

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
      .exclude('companies', 'companies/{*path}')
      .forRoutes('*');
  }
}
