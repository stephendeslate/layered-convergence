// TRACED: AE-ARCH-04
// TRACED: AE-ARCH-06
// TRACED: AE-SEC-02
// TRACED: AE-SEC-03
// TRACED: AE-INFRA-02
// TRACED: AE-PERF-01
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
