import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, cleanDatabase, request } from './integration-helper';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
  });

  function makeToken(user: { id: string; email: string; role: string; tenantId: string }) {
    const secret = process.env.JWT_SECRET || 'test-secret-key-for-integration-tests';
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      secret,
      { expiresIn: 3600 },
    );
  }

  it('should isolate users by tenant', async () => {
    const password = await bcrypt.hash('Password123!', 10);

    const userA = await prisma.user.create({
      data: { email: 'a@tenant-a.com', password, name: 'User A', role: 'ADMIN', tenantId: 'tenant-a' },
    });
    const userB = await prisma.user.create({
      data: { email: 'b@tenant-b.com', password, name: 'User B', role: 'ADMIN', tenantId: 'tenant-b' },
    });

    const tokenA = makeToken({ id: userA.id, email: userA.email, role: 'ADMIN', tenantId: 'tenant-a' });
    const tokenB = makeToken({ id: userB.id, email: userB.email, role: 'ADMIN', tenantId: 'tenant-b' });

    const resA = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    expect(resA.body.every((u: any) => u.id !== userB.id)).toBe(true);
    expect(resB.body.every((u: any) => u.id !== userA.id)).toBe(true);
  });

  it('should isolate transactions by tenant', async () => {
    const password = await bcrypt.hash('Password123!', 10);

    const buyerA = await prisma.user.create({
      data: { email: 'buyer-a@test.com', password, name: 'Buyer A', role: 'BUYER', tenantId: 'tenant-a' },
    });
    const providerA = await prisma.user.create({
      data: { email: 'provider-a@test.com', password, name: 'Provider A', role: 'PROVIDER', tenantId: 'tenant-a' },
    });
    const buyerB = await prisma.user.create({
      data: { email: 'buyer-b@test.com', password, name: 'Buyer B', role: 'BUYER', tenantId: 'tenant-b' },
    });

    await prisma.transaction.create({
      data: {
        amount: 1000,
        currency: 'usd',
        description: 'Tenant A tx',
        platformFee: 50,
        buyerId: buyerA.id,
        providerId: providerA.id,
        tenantId: 'tenant-a',
        status: 'CREATED',
      },
    });

    const tokenA = makeToken({ id: buyerA.id, email: buyerA.email, role: 'BUYER', tenantId: 'tenant-a' });
    const tokenB = makeToken({ id: buyerB.id, email: buyerB.email, role: 'BUYER', tenantId: 'tenant-b' });

    const resA = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);

    expect(resA.body.length).toBe(1);
    expect(resB.body.length).toBe(0);
  });

  it('should not allow cross-tenant user access', async () => {
    const password = await bcrypt.hash('Password123!', 10);

    const userA = await prisma.user.create({
      data: { email: 'cross@test.com', password, name: 'User', role: 'ADMIN', tenantId: 'tenant-a' },
    });

    const tokenB = makeToken({ id: 'fake-id', email: 'other@test.com', role: 'ADMIN', tenantId: 'tenant-b' });

    await request(app.getHttpServer())
      .get(`/users/${userA.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });
});
