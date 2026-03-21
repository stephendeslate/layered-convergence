import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:TS-002: Integration tests use real DB via docker-compose.test.yml

describe('Escrow Marketplace (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;
  let sellerToken: string;
  let transactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$executeRaw`DELETE FROM webhooks`;
    await prisma.$executeRaw`DELETE FROM disputes`;
    await prisma.$executeRaw`DELETE FROM payouts`;
    await prisma.$executeRaw`DELETE FROM transactions`;
    await prisma.$executeRaw`DELETE FROM users`;
    await app.close();
  });

  describe('Auth', () => {
    it('POST /api/auth/register — should register a buyer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'buyer@test.com',
          password: 'password123',
          name: 'Test Buyer',
          role: 'BUYER',
        })
        .expect(201);

      expect(res.body.email).toBe('buyer@test.com');
      expect(res.body.role).toBe('BUYER');
      expect(res.body).not.toHaveProperty('password');
    });

    it('POST /api/auth/register — should register a seller', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          name: 'Test Seller',
          role: 'SELLER',
        })
        .expect(201);

      expect(res.body.role).toBe('SELLER');
    });

    it('POST /api/auth/register — should reject ADMIN role', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          name: 'Admin',
          role: 'ADMIN',
        })
        .expect(400);
    });

    it('POST /api/auth/login — should login and return token', async () => {
      const buyerRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'buyer@test.com', password: 'password123' })
        .expect(200);

      buyerToken = buyerRes.body.access_token;
      expect(buyerToken).toBeDefined();

      const sellerRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'seller@test.com', password: 'password123' })
        .expect(200);

      sellerToken = sellerRes.body.access_token;
    });
  });

  describe('Transactions', () => {
    it('POST /api/transactions — should create a transaction', async () => {
      const seller = await prisma.user.findUnique({
        where: { email: 'seller@test.com' },
      });

      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          amount: 250.5,
          description: 'Vintage watch',
          sellerId: seller!.id,
        })
        .expect(201);

      transactionId = res.body.id;
      expect(res.body.status).toBe('PENDING');
    });

    it('GET /api/transactions — should list transactions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });

    it('PATCH /api/transactions/:id/status — should update status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/transactions/${transactionId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'FUNDED' })
        .expect(200);

      expect(res.body.status).toBe('FUNDED');
    });

    it('PATCH /api/transactions/:id/status — should reject invalid transition', async () => {
      await request(app.getHttpServer())
        .patch(`/api/transactions/${transactionId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'COMPLETED' })
        .expect(400);
    });
  });

  describe('Disputes', () => {
    it('POST /api/disputes — should create a dispute', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          reason: 'Item not as described',
          transactionId,
        })
        .expect(201);

      expect(res.body.status).toBe('OPEN');
    });

    it('GET /api/disputes — should list disputes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
  });

  describe('Payouts', () => {
    it('GET /api/payouts — should list payouts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/payouts')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Webhooks', () => {
    it('POST /api/webhooks — should create a webhook', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/webhooks')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          url: 'https://example.com/webhook',
          event: 'transaction.completed',
        })
        .expect(201);

      expect(res.body.url).toBe('https://example.com/webhook');
    });

    it('GET /api/webhooks — should list webhooks', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/webhooks')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
  });
});
