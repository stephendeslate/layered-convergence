import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('Error Handling Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);

    // Clean up
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.stripeAccount.deleteMany();
    await prisma.webhookEvent.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create a buyer
    await prisma.user.create({
      data: { email: 'eh-buyer@test.com', passwordHash, name: 'EH Buyer', role: Role.BUYER },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'eh-buyer@test.com', password: 'password123' });
    buyerToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.stripeAccount.deleteMany();
    await prisma.webhookEvent.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('P2002 → 409 Conflict', () => {
    it('should return 409 for duplicate email registration', async () => {
      // First registration
      const res1 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'eh-duplicate@test.com',
          password: 'password123',
          name: 'Duplicate User',
          role: 'BUYER',
        });

      expect(res1.status).toBe(201);

      // Second registration with same email - should get 409 from our custom check
      const res2 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'eh-duplicate@test.com',
          password: 'password456',
          name: 'Duplicate User 2',
          role: 'BUYER',
        });

      expect(res2.status).toBe(409);
    });
  });

  describe('P2025 → 404 Not Found', () => {
    it('should return 404 for non-existent transaction', async () => {
      const res = await request(app.getHttpServer())
        .get('/transactions/non-existent-id')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent webhook event', async () => {
      const res = await request(app.getHttpServer())
        .get('/webhooks/non-existent-id')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test',
          role: 'BUYER',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for password too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'short-pass@test.com',
          password: '123',
          name: 'Test',
          role: 'BUYER',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for non-whitelisted fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'extra-field@test.com',
          password: 'password123',
          name: 'Test',
          role: 'BUYER',
          isAdmin: true,
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid enum value', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'bad-role@test.com',
          password: 'password123',
          name: 'Test',
          role: 'SUPERUSER',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid transaction status', async () => {
      const seller = await prisma.user.create({
        data: {
          email: 'eh-seller-valid@test.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Validation Seller',
          role: Role.SELLER,
        },
      });

      const txnRes = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          amount: 100,
          description: 'Validation test',
          sellerId: seller.id,
        });

      const res = await request(app.getHttpServer())
        .patch(`/transactions/${txnRes.body.id}/status`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });
  });

  describe('Authentication errors', () => {
    it('should return 401 for missing auth header', async () => {
      const res = await request(app.getHttpServer())
        .get('/transactions');

      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid login credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'eh-buyer@test.com',
          password: 'wrong-password',
        });

      expect(res.status).toBe(401);
    });
  });
});
