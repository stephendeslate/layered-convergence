// TRACED:AE-APP-MODULE
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 5,
      },
    ]),
    AuthModule,
    EventsModule,
    DashboardsModule,
    DataSourcesModule,
    PipelinesModule,
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
