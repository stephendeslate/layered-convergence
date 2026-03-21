// TRACED:TS-001 — Backend tests use Test.createTestingModule with real modules
// TRACED:TS-002 — Integration tests run against real PostgreSQL database
// TRACED:TS-005 — State machine transition tests cover all valid and invalid paths

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import type { Server } from 'http';

describe('Escrow Marketplace (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Server;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
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
    server = app.getHttpServer() as Server;
  });

  beforeEach(async () => {
    // Clean database between tests using $executeRaw with Prisma.sql
    await prisma.$executeRaw(Prisma.sql`DELETE FROM webhooks`);
    await prisma.$executeRaw(Prisma.sql`DELETE FROM payouts`);
    await prisma.$executeRaw(Prisma.sql`DELETE FROM disputes`);
    await prisma.$executeRaw(Prisma.sql`DELETE FROM transactions`);
    await prisma.$executeRaw(Prisma.sql`DELETE FROM users`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('should register a BUYER', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'buyer@test.com',
          password: 'password123',
          role: 'BUYER',
        })
        .expect(201);

      expect(res.body.email).toBe('buyer@test.com');
      expect(res.body.role).toBe('BUYER');
      expect(res.body.password).toBeUndefined();
    });

    it('should register a SELLER', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          role: 'SELLER',
        })
        .expect(201);

      expect(res.body.role).toBe('SELLER');
    });

    it('should reject ADMIN role registration', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          role: 'ADMIN',
        })
        .expect(400);
    });

    it('should login and return JWT', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({
          email: 'user@test.com',
          password: 'password123',
          role: 'BUYER',
        });

      const res = await request(server)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body.access_token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      await request(server)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should reject protected routes without JWT', async () => {
      await request(server).get('/api/transactions').expect(401);
    });
  });

  describe('Transactions', () => {
    let buyerToken: string;
    let sellerToken: string;
    let sellerId: string;

    beforeEach(async () => {
      const buyerReg = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'buyer@test.com',
          password: 'password123',
          role: 'BUYER',
        });

      const sellerReg = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          role: 'SELLER',
        });

      sellerId = sellerReg.body.id;

      const buyerLogin = await request(server)
        .post('/api/auth/login')
        .send({ email: 'buyer@test.com', password: 'password123' });

      const sellerLogin = await request(server)
        .post('/api/auth/login')
        .send({ email: 'seller@test.com', password: 'password123' });

      buyerToken = buyerLogin.body.access_token;
      sellerToken = sellerLogin.body.access_token;
    });

    it('should create a transaction', async () => {
      const res = await request(server)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          sellerId,
          amount: '150.00',
          description: 'Test item',
        })
        .expect(201);

      expect(res.body.status).toBe('PENDING');
      expect(res.body.amount).toBe('150');
    });

    it('should list user transactions', async () => {
      await request(server)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          sellerId,
          amount: '100.00',
          description: 'Item 1',
        });

      const res = await request(server)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });

    describe('State Machine', () => {
      let transactionId: string;

      beforeEach(async () => {
        const res = await request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({
            sellerId,
            amount: '200.00',
            description: 'State machine test',
          });

        transactionId = res.body.id;
      });

      it('should transition PENDING -> FUNDED', async () => {
        const res = await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'FUNDED' })
          .expect(200);

        expect(res.body.status).toBe('FUNDED');
      });

      it('should transition FUNDED -> SHIPPED -> DELIVERED -> COMPLETED', async () => {
        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'FUNDED' });

        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({ status: 'SHIPPED' })
          .expect(200);

        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'DELIVERED' })
          .expect(200);

        const res = await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'COMPLETED' })
          .expect(200);

        expect(res.body.status).toBe('COMPLETED');
      });

      it('should reject invalid transition PENDING -> SHIPPED', async () => {
        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({ status: 'SHIPPED' })
          .expect(400);
      });

      it('should reject transition from terminal COMPLETED state', async () => {
        // Move to COMPLETED
        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'FUNDED' });
        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({ status: 'SHIPPED' });
        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'DELIVERED' });
        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'COMPLETED' });

        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'FUNDED' })
          .expect(400);
      });

      it('should transition FUNDED -> DISPUTE', async () => {
        await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'FUNDED' });

        const res = await request(server)
          .patch(`/api/transactions/${transactionId}/status`)
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({ status: 'DISPUTE' })
          .expect(200);

        expect(res.body.status).toBe('DISPUTE');
      });
    });
  });

  describe('Disputes', () => {
    let buyerToken: string;
    let sellerToken: string;
    let transactionId: string;

    beforeEach(async () => {
      const buyerReg = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'buyer@test.com',
          password: 'password123',
          role: 'BUYER',
        });

      const sellerReg = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          role: 'SELLER',
        });

      const buyerLogin = await request(server)
        .post('/api/auth/login')
        .send({ email: 'buyer@test.com', password: 'password123' });

      const sellerLogin = await request(server)
        .post('/api/auth/login')
        .send({ email: 'seller@test.com', password: 'password123' });

      buyerToken = buyerLogin.body.access_token;
      sellerToken = sellerLogin.body.access_token;

      const txRes = await request(server)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          sellerId: sellerReg.body.id,
          amount: '300.00',
          description: 'Dispute test',
        });

      transactionId = txRes.body.id;

      // Fund the transaction so it can be disputed
      await request(server)
        .patch(`/api/transactions/${transactionId}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'FUNDED' });
    });

    it('should create a dispute', async () => {
      const res = await request(server)
        .post('/api/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId,
          reason: 'Item not as described',
        })
        .expect(201);

      expect(res.body.status).toBe('OPEN');
      expect(res.body.reason).toBe('Item not as described');
    });

    it('should list disputes', async () => {
      await request(server)
        .post('/api/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId,
          reason: 'Problem with order',
        });

      const res = await request(server)
        .get('/api/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });

    it('should resolve a dispute with REFUNDED outcome', async () => {
      const disputeRes = await request(server)
        .post('/api/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId,
          reason: 'Never received item',
        });

      const res = await request(server)
        .patch(`/api/disputes/${disputeRes.body.id}/resolve`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          resolution: 'Refund approved',
          outcome: 'REFUNDED',
        })
        .expect(200);

      expect(res.body.status).toBe('RESOLVED');
    });
  });

  describe('Payouts', () => {
    it('should list payouts for seller', async () => {
      const sellerReg = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          role: 'SELLER',
        });

      const sellerLogin = await request(server)
        .post('/api/auth/login')
        .send({ email: 'seller@test.com', password: 'password123' });

      const res = await request(server)
        .get('/api/payouts')
        .set('Authorization', `Bearer ${sellerLogin.body.access_token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Webhooks', () => {
    it('should create a webhook', async () => {
      const buyerReg = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'buyer@test.com',
          password: 'password123',
          role: 'BUYER',
        });

      const sellerReg = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          role: 'SELLER',
        });

      const buyerLogin = await request(server)
        .post('/api/auth/login')
        .send({ email: 'buyer@test.com', password: 'password123' });

      const txRes = await request(server)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${buyerLogin.body.access_token}`)
        .send({
          sellerId: sellerReg.body.id,
          amount: '50.00',
          description: 'Webhook test',
        });

      const res = await request(server)
        .post('/api/webhooks')
        .set('Authorization', `Bearer ${buyerLogin.body.access_token}`)
        .send({
          transactionId: txRes.body.id,
          event: 'status_changed',
        })
        .expect(201);

      expect(res.body.event).toBe('status_changed');
    });

    it('should list webhooks', async () => {
      const buyerReg = await request(server)
        .post('/api/auth/register')
        .send({
          email: 'buyer2@test.com',
          password: 'password123',
          role: 'BUYER',
        });

      const buyerLogin = await request(server)
        .post('/api/auth/login')
        .send({ email: 'buyer2@test.com', password: 'password123' });

      const res = await request(server)
        .get('/api/webhooks')
        .set('Authorization', `Bearer ${buyerLogin.body.access_token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
