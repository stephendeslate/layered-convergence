import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, cleanDatabase, generateToken } from './helpers/integration-setup';
import * as bcrypt from 'bcrypt';

describe('State Machine Transitions (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let buyerToken: string;
  let adminToken: string;
  let buyerId: string;
  let providerId: string;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    prisma = setup.prisma;
    jwtService = setup.jwtService;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    const hashedPassword = await bcrypt.hash('password123', 10);

    const buyer = await prisma.user.create({
      data: {
        email: 'buyer@test.com',
        password: hashedPassword,
        name: 'Buyer',
        role: 'BUYER',
        tenantId: 'tenant-1',
      },
    });
    buyerId = buyer.id;

    const provider = await prisma.user.create({
      data: {
        email: 'provider@test.com',
        password: hashedPassword,
        name: 'Provider',
        role: 'PROVIDER',
        tenantId: 'tenant-1',
      },
    });
    providerId = provider.id;

    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      },
    });

    buyerToken = generateToken(jwtService, {
      sub: buyer.id,
      email: buyer.email,
      role: 'BUYER',
      tenantId: 'tenant-1',
    });

    adminToken = generateToken(jwtService, {
      sub: admin.id,
      email: admin.email,
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });
  });

  it('should create a transaction in CREATED status', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 10000, providerId })
      .expect(201);

    expect(res.body.status).toBe('CREATED');
    expect(res.body.amount).toBe(10000);
  });

  it('should transition CREATED → HELD', async () => {
    const tx = await prisma.transaction.create({
      data: {
        amount: 5000,
        buyerId,
        providerId,
        tenantId: 'tenant-1',
        status: 'CREATED',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ toStatus: 'HELD' })
      .expect(200);

    expect(res.body.status).toBe('HELD');
  });

  it('should transition HELD → RELEASED', async () => {
    const tx = await prisma.transaction.create({
      data: {
        amount: 5000,
        buyerId,
        providerId,
        tenantId: 'tenant-1',
        status: 'HELD',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ toStatus: 'RELEASED', reason: 'Delivery confirmed' })
      .expect(200);

    expect(res.body.status).toBe('RELEASED');
  });

  it('should transition HELD → DISPUTED', async () => {
    const tx = await prisma.transaction.create({
      data: {
        amount: 5000,
        buyerId,
        providerId,
        tenantId: 'tenant-1',
        status: 'HELD',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ toStatus: 'DISPUTED' })
      .expect(200);

    expect(res.body.status).toBe('DISPUTED');
  });

  it('should reject invalid transition CREATED → RELEASED with 400', async () => {
    const tx = await prisma.transaction.create({
      data: {
        amount: 5000,
        buyerId,
        providerId,
        tenantId: 'tenant-1',
        status: 'CREATED',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ toStatus: 'RELEASED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject transition from terminal state RELEASED', async () => {
    const tx = await prisma.transaction.create({
      data: {
        amount: 5000,
        buyerId,
        providerId,
        tenantId: 'tenant-1',
        status: 'RELEASED',
      },
    });

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ toStatus: 'HELD' })
      .expect(400);
  });

  it('should record state history on transition', async () => {
    const tx = await prisma.transaction.create({
      data: {
        amount: 5000,
        buyerId,
        providerId,
        tenantId: 'tenant-1',
        status: 'CREATED',
      },
    });

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ toStatus: 'HELD' })
      .expect(200);

    const history = await prisma.transactionStateHistory.findMany({
      where: { transactionId: tx.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].fromState).toBe('CREATED');
    expect(history[0].toState).toBe('HELD');
  });

  it('should transition through full dispute flow', async () => {
    const tx = await prisma.transaction.create({
      data: {
        amount: 5000,
        buyerId,
        providerId,
        tenantId: 'tenant-1',
        status: 'HELD',
      },
    });

    // HELD → DISPUTED
    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ toStatus: 'DISPUTED' })
      .expect(200);

    // DISPUTED → RESOLVED_BUYER
    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ toStatus: 'RESOLVED_BUYER', reason: 'Buyer wins' })
      .expect(200);

    // RESOLVED_BUYER → REFUNDED
    const res = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ toStatus: 'REFUNDED' })
      .expect(200);

    expect(res.body.status).toBe('REFUNDED');

    const history = await prisma.transactionStateHistory.findMany({
      where: { transactionId: tx.id },
      orderBy: { createdAt: 'asc' },
    });

    expect(history).toHaveLength(3);
  });
});
