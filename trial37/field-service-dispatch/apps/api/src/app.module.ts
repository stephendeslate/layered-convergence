// TRACED: FD-API-002 — Root application module
// TRACED: FD-SEC-002 — Rate limiting with ThrottlerModule and APP_GUARD
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
  ],
})
export class AppModule {}
