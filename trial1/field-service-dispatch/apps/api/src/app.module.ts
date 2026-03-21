import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config';
import { PrismaModule } from './prisma';
import { RedisModule } from './redis';
import { BullMqModule } from './bullmq';
import { AuthModule, JwtAuthGuard } from './auth';
import { TenantContextModule } from './tenant-context';
import { GatewayModule } from './gateway';
import { RoutingModule } from './routing';
import { AuditModule } from './audit';
import { HealthModule } from './health';
import { WorkOrderModule } from './work-order';
import { TechnicianModule } from './technician';
import { CustomerModule } from './customer';
import { DispatchModule } from './dispatch';
import { RouteModule } from './route';
import { InvoiceModule } from './invoice';
import { JobPhotoModule } from './job-photo';
// C3 Supporting modules
import { NotificationModule } from './notification';
import { AnalyticsModule } from './analytics';
import { CustomerPortalModule } from './customer-portal';
import { ScheduleModule } from './schedule';
import { CompanyModule } from './company';
import { ServiceTypeModule } from './service-type';
import { LineItemModule } from './line-item';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    BullMqModule,
    AuthModule,
    TenantContextModule,
    GatewayModule,
    RoutingModule,
    AuditModule,
    HealthModule,
    // Core domain modules
    WorkOrderModule,
    TechnicianModule,
    CustomerModule,
    DispatchModule,
    RouteModule,
    InvoiceModule,
    JobPhotoModule,
    // C3 Supporting modules
    NotificationModule,
    AnalyticsModule,
    CustomerPortalModule,
    ScheduleModule,
    CompanyModule,
    ServiceTypeModule,
    LineItemModule,
  ],
  providers: [
    // Global JWT auth guard (use @Public() to exempt routes)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global roles guard (use @Roles() to restrict)
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global throttle guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Global exception filter
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
