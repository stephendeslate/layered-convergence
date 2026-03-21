import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { StripeService } from '../src/stripe/stripe.service';
import { AutoReleaseService } from '../src/transactions/auto-release.service';
import { AutoReleaseProcessor } from '../src/transactions/auto-release.processor';
import { getQueueToken } from '@nestjs/bullmq';
import { AUTO_RELEASE_QUEUE } from '../src/transactions/auto-release.processor';

const TEST_JWT_SECRET = 'e2e-test-jwt-secret-minimum-32-characters';
const TEST_JWT_REFRESH_SECRET = 'e2e-test-jwt-refresh-secret-minimum-32-chars';

process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.JWT_REFRESH_SECRET = TEST_JWT_REFRESH_SECRET;
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_e2e_testing';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake_webhook_secret';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.CORS_ORIGINS = 'http://localhost:3001';
process.env.PLATFORM_FEE_PERCENT = '10';
process.env.MIN_PLATFORM_FEE_CENTS = '50';
process.env.APP_URL = 'http://localhost:3001';

const BUYER_ID = 'a0000000-0000-4000-8000-000000000001';
const BUYER2_ID = 'b0000000-0000-4000-8000-000000000002';
const PROVIDER_ID = 'c0000000-0000-4000-8000-000000000003';
const ADMIN_ID = 'd0000000-0000-4000-8000-000000000004';

const mockUsers: Record<string, any> = {
  [BUYER_ID]: { id: BUYER_ID, email: 'buyer@test.com', name: 'Test Buyer', role: 'BUYER', passwordHash: '' },
  [BUYER2_ID]: { id: BUYER2_ID, email: 'buyer2@test.com', name: 'Test Buyer 2', role: 'BUYER', passwordHash: '' },
  [PROVIDER_ID]: {
    id: PROVIDER_ID, email: 'provider@test.com', name: 'Test Provider', role: 'PROVIDER', passwordHash: '',
    connectedAccount: { stripeAccountId: 'acct_test123', onboardingStatus: 'ACTIVE', chargesEnabled: true, payoutsEnabled: true },
  },
  [ADMIN_ID]: { id: ADMIN_ID, email: 'admin@test.com', name: 'Test Admin', role: 'ADMIN', passwordHash: '' },
};

const mockTransactions: Record<string, any> = {};
const mockStateHistory: any[] = [];
const mockDisputes: Record<string, any> = {};
const mockPayouts: any[] = [];
let txCounter = 0;

function createMockPrisma() {
  return {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(async (fn: Function) => fn(createMockPrisma())),
    $queryRaw: vi.fn(),
    onModuleInit: vi.fn(),
    onModuleDestroy: vi.fn(),
    withRlsContext: vi.fn(),
    user: {
      findUnique: vi.fn(({ where }: any) => {
        if (where.email) return Object.values(mockUsers).find((u: any) => u.email === where.email) ?? null;
        return mockUsers[where.id] ?? null;
      }),
      findMany: vi.fn(() => Object.values(mockUsers)),
      create: vi.fn(({ data }: any) => {
        const id = `user-${Date.now()}`;
        const user = { id, ...data, createdAt: new Date() };
        mockUsers[id] = user;
        return user;
      }),
    },
    transaction: {
      findUnique: vi.fn(({ where }: any) => {
        if (where.id) return mockTransactions[where.id] ?? null;
        if (where.stripePaymentIntentId) return Object.values(mockTransactions).find((t: any) => t.stripePaymentIntentId === where.stripePaymentIntentId) ?? null;
        return null;
      }),
      findMany: vi.fn(({ where }: any) => {
        return Object.values(mockTransactions).filter((t: any) => {
          if (where?.buyerId && t.buyerId !== where.buyerId) return false;
          if (where?.providerId && t.providerId !== where.providerId) return false;
          if (where?.status && t.status !== where.status) return false;
          return true;
        });
      }),
      count: vi.fn(({ where }: any) => {
        return Object.values(mockTransactions).filter((t: any) => {
          if (where?.buyerId && t.buyerId !== where.buyerId) return false;
          if (where?.providerId && t.providerId !== where.providerId) return false;
          return true;
        }).length;
      }),
      create: vi.fn(({ data }: any) => {
        const id = `tx-${++txCounter}`;
        const tx = {
          id, ...data, currency: 'usd', createdAt: new Date(), updatedAt: new Date(),
          holdExpiresAt: null, releasedAt: null, refundedAt: null,
          provider: mockUsers[data.providerId],
          buyer: mockUsers[data.buyerId],
        };
        mockTransactions[id] = tx;
        return tx;
      }),
      update: vi.fn(({ where, data }: any) => {
        const tx = mockTransactions[where.id];
        if (tx) Object.assign(tx, data);
        return tx;
      }),
    },
    transactionStateHistory: {
      create: vi.fn(({ data }: any) => {
        const entry = { id: `sh-${Date.now()}`, ...data, createdAt: new Date() };
        mockStateHistory.push(entry);
        return entry;
      }),
    },
    dispute: {
      findUnique: vi.fn(({ where }: any) => mockDisputes[where.id] ?? null),
      findFirst: vi.fn(() => null),
      findMany: vi.fn(() => Object.values(mockDisputes)),
      count: vi.fn(() => Object.values(mockDisputes).length),
      create: vi.fn(({ data }: any) => {
        const id = `disp-${Date.now()}`;
        const dispute = { id, ...data, createdAt: new Date() };
        mockDisputes[id] = dispute;
        return dispute;
      }),
      update: vi.fn(({ where, data }: any) => {
        const d = mockDisputes[where.id];
        if (d) Object.assign(d, data);
        return d;
      }),
    },
    payout: {
      create: vi.fn(({ data }: any) => {
        const payout = { id: `pay-${Date.now()}`, ...data, createdAt: new Date() };
        mockPayouts.push(payout);
        return payout;
      }),
      findMany: vi.fn(() => mockPayouts),
      count: vi.fn(() => mockPayouts.length),
    },
    stripeConnectedAccount: {
      findUnique: vi.fn(({ where }: any) => {
        if (where.userId === PROVIDER_ID) {
          return { id: 'sca-1', userId: PROVIDER_ID, stripeAccountId: 'acct_test123', onboardingStatus: 'ACTIVE' };
        }
        return null;
      }),
      create: vi.fn(({ data }: any) => ({ id: `sca-${Date.now()}`, ...data })),
      update: vi.fn(({ where, data }: any) => ({ ...where, ...data })),
    },
    webhookLog: {
      findUnique: vi.fn(() => null),
      create: vi.fn(({ data }: any) => ({ id: `wl-${Date.now()}`, ...data })),
      update: vi.fn(({ where, data }: any) => ({ ...where, ...data })),
    },
  };
}

function createMockStripeService() {
  return {
    stripe: {
      accounts: {
        create: vi.fn().mockResolvedValue({ id: 'acct_new123' }),
        retrieve: vi.fn().mockResolvedValue({ charges_enabled: true, payouts_enabled: true, details_submitted: true }),
      },
      accountLinks: {
        create: vi.fn().mockResolvedValue({ url: 'https://connect.stripe.com/test' }),
      },
    },
    onModuleInit: vi.fn(),
    createPaymentIntent: vi.fn().mockResolvedValue({ id: 'pi_test_123', client_secret: 'pi_test_123_secret' }),
    createTransfer: vi.fn().mockResolvedValue({ id: 'tr_test_123' }),
    createRefund: vi.fn().mockResolvedValue({ id: 're_test_123' }),
    cancelPaymentIntent: vi.fn().mockResolvedValue({ id: 'pi_test_123' }),
    constructWebhookEvent: vi.fn(),
  };
}

describe('App E2E Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let buyerToken: string;
  let buyer2Token: string;
  let providerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createMockPrisma())
      .overrideProvider(StripeService)
      .useValue(createMockStripeService())
      .overrideProvider(AutoReleaseService)
      .useValue({
        scheduleAutoRelease: vi.fn(),
        cancelAutoRelease: vi.fn(),
      })
      .overrideProvider(AutoReleaseProcessor)
      .useValue({
        process: vi.fn(),
      })
      .overrideProvider(getQueueToken(AUTO_RELEASE_QUEUE))
      .useValue({
        add: vi.fn(),
        getJob: vi.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: ['http://localhost:3001'],
      credentials: true,
    });
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    buyerToken = jwtService.sign(
      { sub: BUYER_ID, email: 'buyer@test.com', role: 'BUYER' },
      { secret: TEST_JWT_SECRET, expiresIn: '1h' },
    );
    buyer2Token = jwtService.sign(
      { sub: BUYER2_ID, email: 'buyer2@test.com', role: 'BUYER' },
      { secret: TEST_JWT_SECRET, expiresIn: '1h' },
    );
    providerToken = jwtService.sign(
      { sub: PROVIDER_ID, email: 'provider@test.com', role: 'PROVIDER' },
      { secret: TEST_JWT_SECRET, expiresIn: '1h' },
    );
    adminToken = jwtService.sign(
      { sub: ADMIN_ID, email: 'admin@test.com', role: 'ADMIN' },
      { secret: TEST_JWT_SECRET, expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('Auth', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await request(app.getHttpServer()).get('/api/transactions');
      expect(res.status).toBe(401);
    });

    it('rejects invalid JWT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('accepts valid JWT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Role-based access', () => {
    it('prevents provider from creating transactions', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ providerId: PROVIDER_ID, amount: 1000, description: 'Test' });
      expect(res.status).toBe(403);
    });

    it('prevents buyer from accessing Stripe Connect', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/stripe/connect/onboard')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).toBe(403);
    });

    it('prevents provider from refunding', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/a0000000-0000-4000-8000-000000000001/refund')
        .set('Authorization', `Bearer ${providerToken}`);
      expect(res.status).toBe(403);
    });

    it('prevents buyer from resolving disputes', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/disputes/a0000000-0000-4000-8000-000000000001/resolve')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ resolution: 'BUYER', notes: 'test' });
      expect(res.status).toBe(403);
    });
  });

  describe('Input validation', () => {
    it('rejects transaction with amount below minimum', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ providerId: 'a0000000-0000-4000-8000-000000000001', amount: 50, description: 'Test' });
      expect(res.status).toBe(400);
    });

    it('rejects transaction with missing description', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ providerId: 'a0000000-0000-4000-8000-000000000001', amount: 1000 });
      expect(res.status).toBe(400);
    });

    it('rejects transaction with non-UUID providerId', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ providerId: 'not-a-uuid', amount: 1000, description: 'Test' });
      expect(res.status).toBe(400);
    });

    it('rejects extra properties (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          providerId: 'a0000000-0000-4000-8000-000000000001',
          amount: 1000,
          description: 'Test',
          malicious: 'data',
        });
      expect(res.status).toBe(400);
    });

    it('rejects invalid UUID in path params', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions/not-a-uuid')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).toBe(400);
    });
  });

  describe('Transaction lifecycle', () => {
    it('creates transaction as buyer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ providerId: PROVIDER_ID, amount: 5000, description: 'E2E test payment' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('clientSecret');
      expect(res.body.status).toBe('CREATED');
      expect(res.body.amount).toBe(5000);
    });

    it('lists transactions for buyer', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
    });
  });

  describe('Webhook endpoint', () => {
    it('rejects webhook without signature', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/webhooks/stripe')
        .send({});
      expect(res.status).toBe(400);
    });

    it('rejects webhook with invalid signature', async () => {
      const stripeService = app.get(StripeService);
      (stripeService.constructWebhookEvent as any).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const res = await request(app.getHttpServer())
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'invalid-sig')
        .set('Content-Type', 'application/json')
        .send(Buffer.from('{}'));
      expect(res.status).toBe(400);
    });
  });

  describe('CORS and security headers', () => {
    it('returns appropriate status for OPTIONS preflight', async () => {
      const res = await request(app.getHttpServer())
        .options('/api/transactions')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'GET');
      expect([200, 204]).toContain(res.status);
    });
  });
});
