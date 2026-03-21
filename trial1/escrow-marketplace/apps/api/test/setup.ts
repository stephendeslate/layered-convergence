/**
 * E2E test setup — bootstraps a real NestJS app for integration testing.
 *
 * Uses the actual AppModule with mock Stripe (default dev behavior)
 * and an in-memory or test-dedicated database.
 *
 * IMPORTANT: Requires DATABASE_URL pointing to a test database and
 * REDIS_URL pointing to a test Redis instance (or mock).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as request from 'supertest';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
  /** Send HTTP requests against the test app */
  request: ReturnType<typeof request.default>;
}

let cachedApp: TestApp | null = null;

/**
 * Create (or reuse) a NestJS test app with identical config to production.
 */
export async function createTestApp(): Promise<TestApp> {
  if (cachedApp) return cachedApp;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  const prisma = app.get(PrismaService);

  cachedApp = {
    app,
    prisma,
    request: request.default(app.getHttpServer()),
  };

  return cachedApp;
}

/**
 * Clean all data from the test database (reverse dependency order).
 */
export async function cleanDatabase(prisma: PrismaService) {
  await prisma.transactionStateHistory.deleteMany();
  await prisma.disputeEvidence.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.webhookLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stripeConnectedAccount.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Close the test app and disconnect.
 */
export async function closeTestApp() {
  if (cachedApp) {
    await cachedApp.app.close();
    cachedApp = null;
  }
}

/**
 * Register a user and return { user, tokens }.
 */
export async function registerUser(
  req: ReturnType<typeof request.default>,
  data: {
    email: string;
    password: string;
    displayName: string;
    role: 'BUYER' | 'PROVIDER';
  },
) {
  const res = await req
    .post('/api/v1/auth/register')
    .send(data)
    .expect(201);
  return res.body as {
    user: { id: string; email: string; role: string; displayName: string };
    tokens: { accessToken: string; refreshToken: string };
  };
}

/**
 * Login and return { user, tokens }.
 */
export async function loginUser(
  req: ReturnType<typeof request.default>,
  email: string,
  password: string,
) {
  const res = await req
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);
  return res.body as {
    user: { id: string; email: string; role: string };
    tokens: { accessToken: string; refreshToken: string };
  };
}

/**
 * Create an admin user directly in the database (admins can't self-register).
 */
export async function createAdminUser(
  prisma: PrismaService,
  req: ReturnType<typeof request.default>,
) {
  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.hash('AdminTest123', 4);

  const admin = await prisma.user.create({
    data: {
      email: 'admin-e2e@test.com',
      passwordHash,
      displayName: 'Admin E2E',
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Login to get tokens
  const res = await req
    .post('/api/v1/auth/login')
    .send({ email: 'admin-e2e@test.com', password: 'AdminTest123' })
    .expect(200);

  return {
    user: admin,
    tokens: res.body.tokens as { accessToken: string; refreshToken: string },
  };
}

/**
 * Set up provider onboarding (create StripeConnectedAccount directly for tests).
 */
export async function onboardProvider(
  prisma: PrismaService,
  providerId: string,
) {
  return prisma.stripeConnectedAccount.create({
    data: {
      userId: providerId,
      stripeAccountId: `acct_test_${providerId.slice(0, 8)}`,
      onboardingStatus: 'COMPLETE',
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
    },
  });
}
