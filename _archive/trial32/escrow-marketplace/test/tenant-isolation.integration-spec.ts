import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase } from './integration-helper';
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

  function createTenantUser(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
  ): string {
    const secret = process.env.JWT_SECRET || 'test-secret-key-for-integration-tests';
    const token = jwt.sign({ sub: userId, email, role, tenantId }, secret, { expiresIn: 3600 });
    return `Bearer ${token}`;
  }

  async function seedUser(id: string, email: string, role: string, tenantId: string) {
    return prisma.user.create({
      data: {
        id,
        email,
        password: '$2b$10$dummyhashvalue1234567890abcdefghijklmnopqrstuv',
        name: `${role} User`,
        role: role as any,
        tenantId,
      },
    });
  }

  it('should isolate transactions by tenantId', async () => {
    const buyerA = await seedUser('buyer-a', 'buyerA@test.com', 'BUYER', 'tenant-alpha');
    const providerA = await seedUser('provider-a', 'providerA@test.com', 'PROVIDER', 'tenant-alpha');
    const buyerB = await seedUser('buyer-b', 'buyerB@test.com', 'BUYER', 'tenant-beta');
    const providerB = await seedUser('provider-b', 'providerB@test.com', 'PROVIDER', 'tenant-beta');

    const authA = createTenantUser('buyer-a', 'buyerA@test.com', 'BUYER', 'tenant-alpha');
    const authB = createTenantUser('buyer-b', 'buyerB@test.com', 'BUYER', 'tenant-beta');

    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authA)
      .send({ amount: 5000, providerId: 'provider-a', description: 'Tenant A tx' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authB)
      .send({ amount: 7000, providerId: 'provider-b', description: 'Tenant B tx' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', authA)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].description).toBe('Tenant A tx');

    const resB = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', authB)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].description).toBe('Tenant B tx');
  });

  it('should prevent cross-tenant transaction access by ID', async () => {
    const buyerA = await seedUser('buyer-c', 'buyerC@test.com', 'BUYER', 'tenant-alpha');
    const providerA = await seedUser('provider-c', 'providerC@test.com', 'PROVIDER', 'tenant-alpha');
    const buyerB = await seedUser('buyer-d', 'buyerD@test.com', 'BUYER', 'tenant-beta');

    const authA = createTenantUser('buyer-c', 'buyerC@test.com', 'BUYER', 'tenant-alpha');
    const authB = createTenantUser('buyer-d', 'buyerD@test.com', 'BUYER', 'tenant-beta');

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authA)
      .send({ amount: 5000, providerId: 'provider-c', description: 'Alpha only' })
      .expect(201);

    const txId = createRes.body.id;

    await request(app.getHttpServer())
      .get(`/transactions/${txId}`)
      .set('Authorization', authA)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/transactions/${txId}`)
      .set('Authorization', authB)
      .expect(404);
  });

  it('should prevent cross-tenant state transitions', async () => {
    const buyerA = await seedUser('buyer-e', 'buyerE@test.com', 'BUYER', 'tenant-alpha');
    const providerA = await seedUser('provider-e', 'providerE@test.com', 'PROVIDER', 'tenant-alpha');

    const authA = createTenantUser('buyer-e', 'buyerE@test.com', 'BUYER', 'tenant-alpha');
    const adminB = createTenantUser('admin-b', 'adminB@test.com', 'ADMIN', 'tenant-beta');

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authA)
      .send({ amount: 5000, providerId: 'provider-e', description: 'No cross tenant' })
      .expect(201);

    const txId = createRes.body.id;

    await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', adminB)
      .send({ status: 'HELD', reason: 'Cross tenant attempt' })
      .expect(404);
  });

  it('should scope transaction history to tenant', async () => {
    const buyerA = await seedUser('buyer-f', 'buyerF@test.com', 'BUYER', 'tenant-alpha');
    const providerA = await seedUser('provider-f', 'providerF@test.com', 'PROVIDER', 'tenant-alpha');

    const authAlpha = createTenantUser('buyer-f', 'buyerF@test.com', 'BUYER', 'tenant-alpha');
    const authBeta = createTenantUser('admin-beta', 'adminBeta@test.com', 'ADMIN', 'tenant-beta');

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authAlpha)
      .send({ amount: 3000, providerId: 'provider-f', description: 'History test' })
      .expect(201);

    const txId = createRes.body.id;

    const historyRes = await request(app.getHttpServer())
      .get(`/transactions/${txId}/history`)
      .set('Authorization', authAlpha)
      .expect(200);

    expect(historyRes.body.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .get(`/transactions/${txId}/history`)
      .set('Authorization', authBeta)
      .expect(404);
  });

  it('should isolate users by tenant when listing', async () => {
    await seedUser('user-t1', 'user-t1@test.com', 'BUYER', 'tenant-one');
    await seedUser('user-t2', 'user-t2@test.com', 'BUYER', 'tenant-two');

    const adminT1 = createTenantUser('admin-t1', 'admin-t1@test.com', 'ADMIN', 'tenant-one');
    const adminT2 = createTenantUser('admin-t2', 'admin-t2@test.com', 'ADMIN', 'tenant-two');

    const res1 = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', adminT1)
      .expect(200);

    const res2 = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', adminT2)
      .expect(200);

    const emails1 = res1.body.map((u: any) => u.email);
    const emails2 = res2.body.map((u: any) => u.email);

    expect(emails1).not.toContain('user-t2@test.com');
    expect(emails2).not.toContain('user-t1@test.com');
  });
});
