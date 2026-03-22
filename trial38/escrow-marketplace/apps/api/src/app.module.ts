import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ResponseTimeInterceptor } from './interceptors/response-time.interceptor';

// TRACED: EM-SEC-002 — Rate limiting (global 100/min, auth 5/min)
// TRACED: EM-INFRA-004 — pnpm audit in CI pipeline for dependency security
// TRACED: EM-PERF-003 — Response time interceptor registered globally
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    PrismaModule,
    AuthModule,
    ListingsModule,
    TransactionsModule,
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
