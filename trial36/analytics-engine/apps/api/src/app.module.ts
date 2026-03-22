import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { PipelinesModule } from './pipelines/pipelines.module';

// TRACED: AE-SEC-002
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60000', 10),
          limit: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
        },
      ],
    }),
    AuthModule,
    DashboardsModule,
    PipelinesModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
