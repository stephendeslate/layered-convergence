import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { CustomersModule } from './customers/customers.module';
import { TechniciansModule } from './technicians/technicians.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RoutesModule } from './routes/routes.module';
import { GpsModule } from './gps/gps.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompaniesModule,
    CustomersModule,
    TechniciansModule,
    WorkOrdersModule,
    InvoicesModule,
    RoutesModule,
    GpsModule,
  ],
})
export class AppModule {}
