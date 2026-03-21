import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, getAuthHeader } from './integration-helper';
import * as jwt from 'jsonwebtoken';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  function createTokenForTenant(userId: string, tenantId: string, role = 'BUYER') {
    return jwt.sign(
      { sub: userId, email: `${userId}@test.com`, role, tenantId },
      process.env.JWT_SECRET || 'test-secret-key-for-testing-purposes-only',
    );
  }

  it('should isolate users by tenant', async () => {
    const user1 = await prisma.user.create({
      data: { email: 'user1@t1.com', password: 'hashed', name: 'User1', role: 'ADMIN', tenantId: 'tenant-1' },
    });
    const user2 = await prisma.user.create({
      data: { email: 'user2@t2.com', password: 'hashed', name: 'User2', role: 'ADMIN', tenantId: 'tenant-2' },
    });

    const token1 = createTokenForTenant(user1.id, 'tenant-1', 'ADMIN');
    const token2 = createTokenForTenant(user2.id, 'tenant-2', 'ADMIN');

    const res1 = await request(app.getHttpServer())
      .get('/users')
      .set(getAuthHeader(token1));

    const res2 = await request(app.getHttpServer())
      .get('/users')
      .set(getAuthHeader(token2));

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    const emails1 = res1.body.map((u: any) => u.email);
    const emails2 = res2.body.map((u: any) => u.email);

    expect(emails1).toContain('user1@t1.com');
    expect(emails1).not.toContain('user2@t2.com');
    expect(emails2).toContain('user2@t2.com');
    expect(emails2).not.toContain('user1@t1.com');
  });

  it('should isolate transactions by tenant', async () => {
    const buyer1 = await prisma.user.create({
      data: { email: 'buyer1@t1.com', password: 'hashed', name: 'Buyer1', role: 'BUYER', tenantId: 'tenant-1' },
    });
    const prov1 = await prisma.user.create({
      data: { email: 'prov1@t1.com', password: 'hashed', name: 'Prov1', role: 'PROVIDER', tenantId: 'tenant-1' },
    });
    const buyer2 = await prisma.user.create({
      data: { email: 'buyer2@t2.com', password: 'hashed', name: 'Buyer2', role: 'BUYER', tenantId: 'tenant-2' },
    });
    const prov2 = await prisma.user.create({
      data: { email: 'prov2@t2.com', password: 'hashed', name: 'Prov2', role: 'PROVIDER', tenantId: 'tenant-2' },
    });

    await prisma.transaction.create({
      data: { amount: 1000, buyerId: buyer1.id, providerId: prov1.id, tenantId: 'tenant-1', platformFee: 50 },
    });
    await prisma.transaction.create({
      data: { amount: 2000, buyerId: buyer2.id, providerId: prov2.id, tenantId: 'tenant-2', platformFee: 100 },
    });

    const token1 = createTokenForTenant(buyer1.id, 'tenant-1');
    const token2 = createTokenForTenant(buyer2.id, 'tenant-2');

    const res1 = await request(app.getHttpServer())
      .get('/transactions')
      .set(getAuthHeader(token1));
    const res2 = await request(app.getHttpServer())
      .get('/transactions')
      .set(getAuthHeader(token2));

    expect(res1.body).toHaveLength(1);
    expect(res1.body[0].amount).toBe(1000);
    expect(res2.body).toHaveLength(1);
    expect(res2.body[0].amount).toBe(2000);
  });

  it('should prevent cross-tenant transaction access', async () => {
    const buyer = await prisma.user.create({
      data: { email: 'buyerX@t1.com', password: 'hashed', name: 'BuyerX', role: 'BUYER', tenantId: 'tenant-1' },
    });
    const prov = await prisma.user.create({
      data: { email: 'provX@t1.com', password: 'hashed', name: 'ProvX', role: 'PROVIDER', tenantId: 'tenant-1' },
    });

    const tx = await prisma.transaction.create({
      data: { amount: 5000, buyerId: buyer.id, providerId: prov.id, tenantId: 'tenant-1', platformFee: 250 },
    });

    const otherTenantToken = createTokenForTenant('other-user', 'tenant-2');

    const res = await request(app.getHttpServer())
      .get(`/transactions/${tx.id}`)
      .set(getAuthHeader(otherTenantToken));

    expect(res.status).toBe(404);
  });
});
