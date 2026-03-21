import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './company/company.module';
import { CustomerModule } from './customer/customer.module';
import { TechnicianModule } from './technician/technician.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { RouteModule } from './route/route.module';
import { GpsEventModule } from './gps-event/gps-event.module';
import { InvoiceModule } from './invoice/invoice.module';
import { CompanyContextMiddleware } from './common/middleware/company-context.middleware';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompanyModule,
    CustomerModule,
    TechnicianModule,
    WorkOrderModule,
    RouteModule,
    GpsEventModule,
    InvoiceModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompanyContextMiddleware)
      .exclude('auth/(.*)')
      .forRoutes('*');
  }
}
