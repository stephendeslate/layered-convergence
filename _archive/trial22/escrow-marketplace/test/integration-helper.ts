import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { TransactionsModule } from '../src/transactions/transactions.module';
import { DisputesModule } from '../src/disputes/disputes.module';
import { PayoutsModule } from '../src/payouts/payouts.module';
import { WebhooksModule } from '../src/webhooks/webhooks.module';
import { AnalyticsModule } from '../src/analytics/analytics.module';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

export async function createTestApp(): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      BullModule.forRoot({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6380', 10),
        },
      }),
      PrismaModule,
      AuthModule,
      UsersModule,
      TransactionsModule,
      DisputesModule,
      PayoutsModule,
      WebhooksModule,
      AnalyticsModule,
    ],
    providers: [
      { provide: APP_GUARD, useClass: AuthGuard },
      { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  const prisma = app.get(PrismaService);

  return { app, prisma };
}

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE "WebhookLog", "Payout", "Dispute", "TransactionStateHistory", "Transaction", "StripeConnectedAccount", "User" CASCADE`;
}

export async function createTestUser(
  prisma: PrismaService,
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
    role: string;
    tenantId: string;
  }> = {},
) {
  const bcrypt = await import('bcrypt');
  const hashed = await bcrypt.hash(overrides.password || 'password123', 10);

  return prisma.user.create({
    data: {
      email: overrides.email || `test-${Date.now()}@test.com`,
      password: hashed,
      name: overrides.name || 'Test User',
      role: (overrides.role as any) || 'BUYER',
      tenantId: overrides.tenantId || 'default',
    },
  });
}

export function generateToken(user: { id: string; email: string; role: string; tenantId?: string }) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId || 'default' },
    process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only',
    { expiresIn: 3600 },
  );
}
