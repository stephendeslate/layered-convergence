// TRACED:AE-ARCH-04 — AppModule with ThrottlerModule APP_GUARD and ResponseTimeInterceptor APP_INTERCEPTOR
// TRACED:AE-SEC-08 — ThrottlerModule as APP_GUARD with CORS from env (no fallback)

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { PipelinesModule } from './pipelines/pipelines.module';
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
    DashboardsModule,
    PipelinesModule,
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
