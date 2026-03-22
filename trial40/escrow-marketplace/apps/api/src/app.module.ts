// TRACED: EM-ARCH-003 — NestJS module architecture with global PrismaModule
// TRACED: EM-SEC-003 — ThrottlerModule with APP_GUARD
// TRACED: EM-PERF-003 — ResponseTimeInterceptor as APP_INTERCEPTOR
// TRACED: EM-MON-004 — Global exception filter as APP_FILTER
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EscrowsModule } from './escrows/escrows.module';
import { DisputesModule } from './disputes/disputes.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { GlobalExceptionFilter } from './monitoring/global-exception.filter';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    ListingsModule,
    TransactionsModule,
    EscrowsModule,
    DisputesModule,
    MonitoringModule,
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
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
