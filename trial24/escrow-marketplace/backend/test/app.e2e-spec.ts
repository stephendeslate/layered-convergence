import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// [TRACED:TS-003] Integration test uses Test.createTestingModule with real AppModule
// ZERO jest.spyOn on Prisma — all database operations go through real Prisma client
describe('Escrow Marketplace (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;
  let sellerToken: string;
  let transactionId: string;
  let disputeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up test data
    await prisma.webhook.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.webhook.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('Auth flow', () => {
    it('should register a buyer', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'buyer@test.com',
          password: 'password123',
          name: 'Test Buyer',
          role: 'BUYER',
        })
        .expect(201);

      expect(res.body.access_token).toBeDefined();
      buyerToken = res.body.access_token;
    });

    it('should register a seller', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          name: 'Test Seller',
          role: 'SELLER',
        })
        .expect(201);

      expect(res.body.access_token).toBeDefined();
      sellerToken = res.body.access_token;
    });

    it('should login a buyer', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'buyer@test.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body.access_token).toBeDefined();
    });

    it('should reject duplicate registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'buyer@test.com',
          password: 'password123',
          name: 'Duplicate',
          role: 'BUYER',
        })
        .expect(409);
    });

    it('should reject ADMIN role registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          name: 'Admin Attempt',
          role: 'ADMIN',
        })
        .expect(400);
    });
  });

  describe('Transaction flow', () => {
    it('should create a transaction', async () => {
      // First get seller ID
      const seller = await prisma.user.findFirst({ where: { email: 'seller@test.com' } });

      const res = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          amount: 250.00,
          description: 'Widget purchase',
          sellerId: seller!.id,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('PENDING');
      transactionId = res.body.id;
    });

    it('should list transactions', async () => {
      const res = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });

    it('should fund a transaction', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/transactions/${transactionId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'FUNDED' })
        .expect(200);

      expect(res.body.status).toBe('FUNDED');
    });

    it('should ship a transaction', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/transactions/${transactionId}/status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'SHIPPED' })
        .expect(200);

      expect(res.body.status).toBe('SHIPPED');
    });

    it('should reject invalid transition', async () => {
      await request(app.getHttpServer())
        .patch(`/transactions/${transactionId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'COMPLETED' })
        .expect(400);
    });
  });

  describe('Dispute flow', () => {
    it('should create a dispute', async () => {
      // First set transaction back to a disputable state
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'SHIPPED' },
      });

      const res = await request(app.getHttpServer())
        .post('/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          reason: 'Item not as described',
          transactionId,
        })
        .expect(201);

      expect(res.body.status).toBe('OPEN');
      disputeId = res.body.id;
    });

    it('should list disputes', async () => {
      const res = await request(app.getHttpServer())
        .get('/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should resolve a dispute', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/disputes/${disputeId}/resolve`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.status).toBe('RESOLVED');
    });
  });

  describe('Webhook flow', () => {
    it('should create a webhook', async () => {
      const res = await request(app.getHttpServer())
        .post('/webhooks')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          url: 'https://example.com/webhook',
          event: 'transaction.completed',
          secret: 'webhook-secret-123',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
    });

    it('should list webhooks', async () => {
      const res = await request(app.getHttpServer())
        .get('/webhooks')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
  });

  describe('Validation', () => {
    it('should reject unknown fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'bad@test.com',
          password: 'password123',
          name: 'Test',
          role: 'BUYER',
          extraField: 'should-be-rejected',
        })
        .expect(400);
    });

    it('should require auth for protected routes', async () => {
      await request(app.getHttpServer()).get('/transactions').expect(401);
    });
  });
});
