import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { TechniciansModule } from './technicians/technicians.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { PartsModule } from './parts/parts.module';
import { GpsModule } from './gps/gps.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompaniesModule,
    TechniciansModule,
    WorkOrdersModule,
    AssignmentsModule,
    PartsModule,
    GpsModule,
  ],
})
export class AppModule {}
