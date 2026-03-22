// TRACED: FD-API-002 — Root application module with ThrottlerGuard and ResponseTimeInterceptor
// TRACED: FD-SEC-002 — Rate limiting via ThrottlerModule registered as APP_GUARD
// TRACED: FD-PERF-003 — ResponseTimeInterceptor registered as APP_INTERCEPTOR
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { AuthModule } from './auth/auth.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { TechniciansModule } from './technicians/technicians.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    PrismaModule,
    AuthModule,
    WorkOrdersModule,
    TechniciansModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class AppModule {}
