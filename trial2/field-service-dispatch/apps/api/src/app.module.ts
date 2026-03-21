import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { CustomersModule } from './modules/customers/customers.module';
import { RoutesModule } from './modules/routes/routes.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { GpsGatewayModule } from './modules/gps-gateway/gps-gateway.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    CompanyModule,
    WorkOrdersModule,
    TechniciansModule,
    CustomersModule,
    RoutesModule,
    DispatchModule,
    GpsGatewayModule,
    InvoicesModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
