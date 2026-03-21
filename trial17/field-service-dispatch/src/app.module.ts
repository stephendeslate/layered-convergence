import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { TechnicianModule } from './technician/technician.module';
import { CustomerModule } from './customer/customer.module';
import { RouteModule } from './route/route.module';
import { InvoiceModule } from './invoice/invoice.module';
import { GpsModule } from './gps/gps.module';
import { CompanyContextMiddleware } from './common/middleware/company-context.middleware';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkOrderModule,
    TechnicianModule,
    CustomerModule,
    RouteModule,
    InvoiceModule,
    GpsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompanyContextMiddleware)
      .exclude(
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/register', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
