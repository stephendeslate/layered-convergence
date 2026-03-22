// TRACED: EM-ARCH-003 — NestJS module architecture with global PrismaModule
// TRACED: EM-SEC-003 — ThrottlerModule with APP_GUARD
// TRACED: EM-PERF-003 — ResponseTimeInterceptor as APP_INTERCEPTOR
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';

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
