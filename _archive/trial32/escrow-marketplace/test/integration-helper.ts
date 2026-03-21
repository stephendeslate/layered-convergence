import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { TransactionsModule } from '../src/transactions/transactions.module';
import { DisputesModule } from '../src/disputes/disputes.module';
import { PayoutsModule } from '../src/payouts/payouts.module';
import { WebhooksModule } from '../src/webhooks/webhooks.module';
import { AnalyticsModule } from '../src/analytics/analytics.module';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { BullModule } from '@nestjs/bullmq';
import * as request from 'supertest';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
        load: [
          () => ({
            JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-for-integration-tests',
            JWT_EXPIRATION: '3600',
            PLATFORM_FEE_PERCENT: '5',
            DATABASE_URL:
              process.env.DATABASE_URL ||
              'postgresql://postgres:postgres@localhost:5433/escrow_test',
          }),
        ],
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
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.init();
  return app;
}

export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE "WebhookLog", "Payout", "Dispute", "TransactionStateHistory", "Transaction", "StripeConnectedAccount", "User" CASCADE`;
}

export async function getAuthHeader(
  app: INestApplication,
  userData: { email: string; password: string; name: string; role?: string },
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/register')
    .send(userData)
    .expect(201);

  return `Bearer ${res.body.token}`;
}

export async function createTestUser(
  app: INestApplication,
  overrides: Partial<{ email: string; password: string; name: string; role: string }> = {},
): Promise<{ token: string; user: any; authHeader: string }> {
  const userData = {
    email: overrides.email || `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
    password: overrides.password || 'testpassword123',
    name: overrides.name || 'Test User',
    role: overrides.role || 'BUYER',
  };

  const res = await request(app.getHttpServer())
    .post('/auth/register')
    .send(userData)
    .expect(201);

  return {
    token: res.body.token,
    user: res.body.user,
    authHeader: `Bearer ${res.body.token}`,
  };
}
