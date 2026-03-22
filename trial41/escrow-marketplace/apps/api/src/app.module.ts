// TRACED:EM-APP-01 AppModule with all global providers registered via DI
// TRACED:EM-ARCH-01 Turborepo monorepo application module
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ValidationPipe } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AuthModule } from './auth/auth.module';
import { ListingModule } from './listing/listing.module';
import { TransactionModule } from './transaction/transaction.module';
import { EscrowModule } from './escrow/escrow.module';
import { DisputeModule } from './dispute/dispute.module';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { GlobalExceptionFilter } from './monitoring/global-exception.filter';
import { CorrelationIdMiddleware } from './monitoring/correlation-id.middleware';
import { RequestLoggingMiddleware } from './monitoring/request-logging.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    MonitoringModule,
    AuthModule,
    ListingModule,
    TransactionModule,
    EscrowModule,
    DisputeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
