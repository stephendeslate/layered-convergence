import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, cleanDatabase, generateToken } from './helpers/integration-setup';
import * as bcrypt from 'bcrypt';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tenant1BuyerToken: string;
  let tenant2BuyerToken: string;
  let tenant1BuyerId: string;
  let tenant1ProviderId: string;
  let tenant2BuyerId: string;
  let tenant2ProviderId: string;

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

    // Tenant 1 users
    const t1Buyer = await prisma.user.create({
      data: { email: 't1-buyer@test.com', password: hashedPassword, name: 'T1 Buyer', role: 'BUYER', tenantId: 'tenant-1' },
    });
    tenant1BuyerId = t1Buyer.id;

    const t1Provider = await prisma.user.create({
      data: { email: 't1-provider@test.com', password: hashedPassword, name: 'T1 Provider', role: 'PROVIDER', tenantId: 'tenant-1' },
    });
    tenant1ProviderId = t1Provider.id;

    // Tenant 2 users
    const t2Buyer = await prisma.user.create({
      data: { email: 't2-buyer@test.com', password: hashedPassword, name: 'T2 Buyer', role: 'BUYER', tenantId: 'tenant-2' },
    });
    tenant2BuyerId = t2Buyer.id;

    const t2Provider = await prisma.user.create({
      data: { email: 't2-provider@test.com', password: hashedPassword, name: 'T2 Provider', role: 'PROVIDER', tenantId: 'tenant-2' },
    });
    tenant2ProviderId = t2Provider.id;

    tenant1BuyerToken = generateToken(jwtService, {
      sub: t1Buyer.id,
      email: t1Buyer.email,
      role: 'BUYER',
      tenantId: 'tenant-1',
    });

    tenant2BuyerToken = generateToken(jwtService, {
      sub: t2Buyer.id,
      email: t2Buyer.email,
      role: 'BUYER',
      tenantId: 'tenant-2',
    });
  });

  it('should only return transactions for the requesting tenant', async () => {
    // Create transactions in both tenants
    await prisma.transaction.create({
      data: { amount: 1000, buyerId: tenant1BuyerId, providerId: tenant1ProviderId, tenantId: 'tenant-1', status: 'CREATED' },
    });
    await prisma.transaction.create({
      data: { amount: 2000, buyerId: tenant2BuyerId, providerId: tenant2ProviderId, tenantId: 'tenant-2', status: 'CREATED' },
    });

    const res1 = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${tenant1BuyerToken}`)
      .expect(200);

    expect(res1.body).toHaveLength(1);
    expect(res1.body[0].tenantId).toBe('tenant-1');

    const res2 = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${tenant2BuyerToken}`)
      .expect(200);

    expect(res2.body).toHaveLength(1);
    expect(res2.body[0].tenantId).toBe('tenant-2');
  });

  it('should not allow tenant-1 to view tenant-2 transaction details', async () => {
    const tx = await prisma.transaction.create({
      data: { amount: 2000, buyerId: tenant2BuyerId, providerId: tenant2ProviderId, tenantId: 'tenant-2', status: 'CREATED' },
    });

    await request(app.getHttpServer())
      .get(`/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${tenant1BuyerToken}`)
      .expect(404);
  });

  it('should only return users for the requesting tenant', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tenant1BuyerToken}`)
      .expect(200);

    expect(res.body.every((u: any) => u.tenantId === 'tenant-1')).toBe(true);
  });

  it('should not allow cross-tenant transaction transition', async () => {
    const tx = await prisma.transaction.create({
      data: { amount: 2000, buyerId: tenant2BuyerId, providerId: tenant2ProviderId, tenantId: 'tenant-2', status: 'CREATED' },
    });

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set('Authorization', `Bearer ${tenant1BuyerToken}`)
      .send({ toStatus: 'HELD' })
      .expect(404);
  });

  it('should scope disputes to tenant', async () => {
    const tx1 = await prisma.transaction.create({
      data: { amount: 1000, buyerId: tenant1BuyerId, providerId: tenant1ProviderId, tenantId: 'tenant-1', status: 'HELD' },
    });

    await prisma.dispute.create({
      data: { transactionId: tx1.id, raisedById: tenant1BuyerId, reason: 'Bad', tenantId: 'tenant-1', status: 'OPEN' },
    });

    const tx2 = await prisma.transaction.create({
      data: { amount: 2000, buyerId: tenant2BuyerId, providerId: tenant2ProviderId, tenantId: 'tenant-2', status: 'HELD' },
    });

    await prisma.dispute.create({
      data: { transactionId: tx2.id, raisedById: tenant2BuyerId, reason: 'Bad too', tenantId: 'tenant-2', status: 'OPEN' },
    });

    const res = await request(app.getHttpServer())
      .get('/disputes')
      .set('Authorization', `Bearer ${tenant1BuyerToken}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].tenantId).toBe('tenant-1');
  });
});
