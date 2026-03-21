import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyContextModule } from './company-context/company-context.module';
import { CustomerModule } from './customer/customer.module';
import { TechnicianModule } from './technician/technician.module';
import { WorkOrderModule } from './work-order/work-order.module';
import { InvoiceModule } from './invoice/invoice.module';
import { RouteModule } from './route/route.module';
import { GpsEventModule } from './gps-event/gps-event.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

// TRACED:SA-001 Feature modules with clear boundaries
// TRACED:AC-001 All endpoints except auth require JWT (via APP_GUARD)
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompanyContextModule,
    CustomerModule,
    TechnicianModule,
    WorkOrderModule,
    InvoiceModule,
    RouteModule,
    GpsEventModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
