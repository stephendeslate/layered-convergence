import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('Transaction State Machine Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;
  let sellerToken: string;
  let adminToken: string;
  let transactionId: string;

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
    const buyer = await prisma.user.create({
      data: { email: 'sm-buyer@test.com', passwordHash, name: 'SM Buyer', role: Role.BUYER },
    });
    const seller = await prisma.user.create({
      data: { email: 'sm-seller@test.com', passwordHash, name: 'SM Seller', role: Role.SELLER },
    });
    const admin = await prisma.user.create({
      data: { email: 'sm-admin@test.com', passwordHash, name: 'SM Admin', role: Role.ADMIN },
    });

    // Login users
    const buyerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sm-buyer@test.com', password: 'password123' });
    buyerToken = buyerLogin.body.accessToken;

    const sellerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sm-seller@test.com', password: 'password123' });
    sellerToken = sellerLogin.body.accessToken;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sm-admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.accessToken;

    // Create a transaction
    const txnRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        amount: 150.00,
        description: 'State machine test item',
        sellerId: seller.id,
      });
    transactionId = txnRes.body.id;
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

  it('should start in PENDING status', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(TransactionStatus.PENDING);
  });

  it('should transition PENDING → FUNDED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/transactions/${transactionId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: TransactionStatus.FUNDED });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(TransactionStatus.FUNDED);
  });

  it('should transition FUNDED → SHIPPED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/transactions/${transactionId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        status: TransactionStatus.SHIPPED,
        shippingInfo: { carrier: 'USPS', trackingNumber: 'TRACK123' },
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(TransactionStatus.SHIPPED);
  });

  it('should transition SHIPPED → DELIVERED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/transactions/${transactionId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: TransactionStatus.DELIVERED });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(TransactionStatus.DELIVERED);
  });

  it('should transition DELIVERED → RELEASED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/transactions/${transactionId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: TransactionStatus.RELEASED });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(TransactionStatus.RELEASED);
  });

  it('should reject invalid transition RELEASED → PENDING', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/transactions/${transactionId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: TransactionStatus.PENDING });

    expect(res.status).toBe(400);
  });

  it('should reject invalid transition PENDING → SHIPPED (skip)', async () => {
    // Create a new PENDING transaction
    const seller = await prisma.user.findFirst({ where: { role: Role.SELLER } });
    const txnRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        amount: 50.00,
        description: 'Skip test',
        sellerId: seller!.id,
      });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txnRes.body.id}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: TransactionStatus.SHIPPED });

    expect(res.status).toBe(400);
  });

  it('should reject invalid transition PENDING → DELIVERED', async () => {
    const seller = await prisma.user.findFirst({ where: { role: Role.SELLER } });
    const txnRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        amount: 50.00,
        description: 'Invalid transition test',
        sellerId: seller!.id,
      });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txnRes.body.id}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: TransactionStatus.DELIVERED });

    expect(res.status).toBe(400);
  });

  it('should handle PENDING → CANCELLED', async () => {
    const seller = await prisma.user.findFirst({ where: { role: Role.SELLER } });
    const txnRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        amount: 30.00,
        description: 'Cancel test',
        sellerId: seller!.id,
      });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txnRes.body.id}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: TransactionStatus.CANCELLED });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(TransactionStatus.CANCELLED);
  });

  it('should reject transition from CANCELLED', async () => {
    const cancelledTxn = await prisma.transaction.findFirst({
      where: { status: TransactionStatus.CANCELLED },
    });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${cancelledTxn!.id}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: TransactionStatus.FUNDED });

    expect(res.status).toBe(400);
  });
});
