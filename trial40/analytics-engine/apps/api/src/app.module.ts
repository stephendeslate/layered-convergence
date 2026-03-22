// TRACED:AE-ARCH-04 — AppModule with ThrottlerModule APP_GUARD, ResponseTimeInterceptor APP_INTERCEPTOR, GlobalExceptionFilter APP_FILTER
// TRACED:AE-SEC-08 — ThrottlerModule as APP_GUARD with CORS from env (no fallback)

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { GlobalExceptionFilter } from './monitoring/global-exception.filter';
import { PinoLoggerService } from './monitoring/logger.provider';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    MonitoringModule,
    AuthModule,
    EventsModule,
    DashboardsModule,
    DataSourcesModule,
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
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    PinoLoggerService,
  ],
})
export class AppModule {}
