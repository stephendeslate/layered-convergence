// TRACED: EM-APP-001
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ListingsModule } from './listings/listings.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EscrowsModule } from './escrows/escrows.module';
import { DisputesModule } from './disputes/disputes.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { GlobalExceptionFilter } from './monitoring/global-exception.filter';
import { ResponseTimeInterceptor } from './monitoring/response-time.interceptor';

@Module({
  imports: [
    // TRACED: EM-THRT-001
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
    ]),
    AuthModule,
    ListingsModule,
    TransactionsModule,
    EscrowsModule,
    DisputesModule,
    MonitoringModule,
  ],
  providers: [
    PrismaService,
    // TRACED: EM-GUARD-001
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // TRACED: EM-GUARD-002
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // TRACED: EM-FILT-001
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // TRACED: EM-PERF-001
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
  ],
})
export class AppModule {}
