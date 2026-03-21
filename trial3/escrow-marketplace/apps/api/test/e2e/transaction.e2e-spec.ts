import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/app.module';

describe('Transaction E2E — Tenant Isolation', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerA: { id: string };
  let providerA: { id: string };
  let buyerB: { id: string };
  let transactionByA: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Create users for two separate buyer/provider pairs
    buyerA = await prisma.user.create({
      data: { email: 'buyerA@test.com', passwordHash: 'hashed', name: 'Buyer A', role: 'BUYER' },
    });
    providerA = await prisma.user.create({
      data: { email: 'providerA@test.com', passwordHash: 'hashed', name: 'Provider A', role: 'PROVIDER' },
    });
    buyerB = await prisma.user.create({
      data: { email: 'buyerB@test.com', passwordHash: 'hashed', name: 'Buyer B', role: 'BUYER' },
    });

    // Create a transaction between buyerA and providerA
    transactionByA = await prisma.transaction.create({
      data: {
        buyerId: buyerA.id,
        providerId: providerA.id,
        amount: 10000,
        description: 'Test transaction',
        platformFee: 500,
        status: 'CREATED',
      },
    });
  });

  afterAll(async () => {
    await prisma.transactionStateHistory.deleteMany({});
    await prisma.dispute.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  it('should allow buyerA to access their transaction', async () => {
    const response = await request(app.getHttpServer())
      .get(`/transactions/${transactionByA.id}`)
      .set('x-user-id', buyerA.id)
      .set('x-user-role', 'BUYER')
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(transactionByA.id);
  });

  // [VERIFY:TENANT_ISOLATION] Cross-user access must return 404
  it('should return 404 when buyerB tries to access buyerA transaction', async () => {
    await request(app.getHttpServer())
      .get(`/transactions/${transactionByA.id}`)
      .set('x-user-id', buyerB.id)
      .set('x-user-role', 'BUYER')
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return empty list when buyerB lists transactions', async () => {
    const response = await request(app.getHttpServer())
      .get('/transactions')
      .set('x-user-id', buyerB.id)
      .set('x-user-role', 'BUYER')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual([]);
  });

  // Cross-user state transition must fail
  it('should return 404 when buyerB tries to transition buyerA transaction', async () => {
    await request(app.getHttpServer())
      .post(`/transactions/${transactionByA.id}/transition`)
      .set('x-user-id', buyerB.id)
      .set('x-user-role', 'BUYER')
      .send({ toState: 'PAYMENT_PENDING' })
      .expect(HttpStatus.NOT_FOUND);
  });

  // State machine validation
  it('should reject invalid state transition', async () => {
    await request(app.getHttpServer())
      .post(`/transactions/${transactionByA.id}/transition`)
      .set('x-user-id', buyerA.id)
      .set('x-user-role', 'BUYER')
      .send({ toState: 'HELD' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should allow valid state transition', async () => {
    const response = await request(app.getHttpServer())
      .post(`/transactions/${transactionByA.id}/transition`)
      .set('x-user-id', buyerA.id)
      .set('x-user-role', 'BUYER')
      .send({ toState: 'PAYMENT_PENDING' })
      .expect(HttpStatus.OK);

    expect(response.body.status).toBe('PAYMENT_PENDING');
  });
});
