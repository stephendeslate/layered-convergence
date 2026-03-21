import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('Tenant Isolation Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyer1Token: string;
  let buyer2Token: string;
  let sellerToken: string;
  let adminToken: string;
  let transaction1Id: string;
  let sellerId: string;

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

    // Create test users
    const buyer1 = await prisma.user.create({
      data: { email: 'ti-buyer1@test.com', passwordHash, name: 'TI Buyer 1', role: Role.BUYER },
    });
    const buyer2 = await prisma.user.create({
      data: { email: 'ti-buyer2@test.com', passwordHash, name: 'TI Buyer 2', role: Role.BUYER },
    });
    const seller = await prisma.user.create({
      data: { email: 'ti-seller@test.com', passwordHash, name: 'TI Seller', role: Role.SELLER },
    });
    const admin = await prisma.user.create({
      data: { email: 'ti-admin@test.com', passwordHash, name: 'TI Admin', role: Role.ADMIN },
    });

    sellerId = seller.id;

    // Login all users
    const b1Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ti-buyer1@test.com', password: 'password123' });
    buyer1Token = b1Login.body.accessToken;

    const b2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ti-buyer2@test.com', password: 'password123' });
    buyer2Token = b2Login.body.accessToken;

    const sLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ti-seller@test.com', password: 'password123' });
    sellerToken = sLogin.body.accessToken;

    const aLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ti-admin@test.com', password: 'password123' });
    adminToken = aLogin.body.accessToken;

    // Create a transaction owned by buyer1
    const txnRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyer1Token}`)
      .send({
        amount: 200.00,
        description: 'Tenant isolation test item',
        sellerId: seller.id,
      });
    transaction1Id = txnRes.body.id;
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

  it('buyer1 can see their own transaction', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transaction1Id}`)
      .set('Authorization', `Bearer ${buyer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(transaction1Id);
  });

  it('seller can see the transaction they are part of', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transaction1Id}`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(transaction1Id);
  });

  it('buyer2 cannot see buyer1 transaction', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transaction1Id}`)
      .set('Authorization', `Bearer ${buyer2Token}`);

    expect(res.status).toBe(403);
  });

  it('admin can see any transaction', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transaction1Id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(transaction1Id);
  });

  it('buyer1 transaction list should not include buyer2 transactions', async () => {
    // Create a transaction for buyer2
    const txnRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyer2Token}`)
      .send({
        amount: 300.00,
        description: 'Buyer 2 item',
        sellerId,
      });

    // buyer1 list should not contain buyer2's transaction
    const res = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${buyer1Token}`);

    expect(res.status).toBe(200);
    const ids = res.body.map((t: { id: string }) => t.id);
    expect(ids).toContain(transaction1Id);
    expect(ids).not.toContain(txnRes.body.id);
  });

  it('admin list includes all transactions', async () => {
    const res = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('unauthenticated request should be rejected', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transaction1Id}`);

    expect(res.status).toBe(401);
  });

  it('invalid token should be rejected', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transaction1Id}`)
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('buyer2 cannot update status on buyer1 transaction', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/transactions/${transaction1Id}/status`)
      .set('Authorization', `Bearer ${buyer2Token}`)
      .send({ status: 'FUNDED' });

    // Should get 403 (forbidden) because buyer2 is not a participant
    expect(res.status).toBe(403);
  });
});
