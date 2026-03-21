import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestUser, generateToken } from './integration-helper';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should isolate transactions by tenant', async () => {
    const buyerA = await createTestUser(prisma, { email: 'buyerA@test.com', role: 'BUYER', tenantId: 'tenant-a' });
    const providerA = await createTestUser(prisma, { email: 'providerA@test.com', role: 'PROVIDER', tenantId: 'tenant-a' });
    const buyerB = await createTestUser(prisma, { email: 'buyerB@test.com', role: 'BUYER', tenantId: 'tenant-b' });
    const providerB = await createTestUser(prisma, { email: 'providerB@test.com', role: 'PROVIDER', tenantId: 'tenant-b' });

    const tokenA = generateToken({ ...buyerA, tenantId: 'tenant-a' });
    const tokenB = generateToken({ ...buyerB, tenantId: 'tenant-b' });

    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ amount: 5000, providerId: providerA.id });

    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ amount: 3000, providerId: providerB.id });

    const resA = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${tokenA}`);

    const resB = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].amount).toBe(5000);
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].amount).toBe(3000);
  });

  it('should not allow accessing another tenant transaction by id', async () => {
    const buyerA = await createTestUser(prisma, { email: 'buyerA2@test.com', role: 'BUYER', tenantId: 'tenant-a' });
    const providerA = await createTestUser(prisma, { email: 'providerA2@test.com', role: 'PROVIDER', tenantId: 'tenant-a' });
    const buyerB = await createTestUser(prisma, { email: 'buyerB2@test.com', role: 'BUYER', tenantId: 'tenant-b' });

    const tokenA = generateToken({ ...buyerA, tenantId: 'tenant-a' });
    const tokenB = generateToken({ ...buyerB, tenantId: 'tenant-b' });

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ amount: 5000, providerId: providerA.id });

    const res = await request(app.getHttpServer())
      .get(`/transactions/${createRes.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });

  it('should isolate users by tenant', async () => {
    const adminA = await createTestUser(prisma, { email: 'adminA@test.com', role: 'ADMIN', tenantId: 'tenant-a' });
    await createTestUser(prisma, { email: 'userA@test.com', role: 'BUYER', tenantId: 'tenant-a' });
    await createTestUser(prisma, { email: 'userB@test.com', role: 'BUYER', tenantId: 'tenant-b' });

    const tokenA = generateToken({ ...adminA, tenantId: 'tenant-a' });

    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const emails = res.body.map((u: any) => u.email);
    expect(emails).toContain('adminA@test.com');
    expect(emails).toContain('userA@test.com');
    expect(emails).not.toContain('userB@test.com');
  });

  it('should not allow cross-tenant user access by id', async () => {
    const adminA = await createTestUser(prisma, { email: 'adminA3@test.com', role: 'ADMIN', tenantId: 'tenant-a' });
    const userB = await createTestUser(prisma, { email: 'userB3@test.com', role: 'BUYER', tenantId: 'tenant-b' });

    const tokenA = generateToken({ ...adminA, tenantId: 'tenant-a' });

    const res = await request(app.getHttpServer())
      .get(`/users/${userB.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
  });
});
