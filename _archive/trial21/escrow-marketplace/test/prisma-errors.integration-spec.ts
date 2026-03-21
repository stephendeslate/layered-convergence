import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, cleanDatabase, generateToken } from './helpers/integration-setup';
import * as bcrypt from 'bcrypt';

describe('Prisma Error Handling (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let buyerToken: string;
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

    const admin = await prisma.user.create({
      data: { email: 'admin@test.com', password: hashedPassword, name: 'Admin', role: 'ADMIN', tenantId: 'tenant-1' },
    });

    const buyer = await prisma.user.create({
      data: { email: 'buyer@test.com', password: hashedPassword, name: 'Buyer', role: 'BUYER', tenantId: 'tenant-1' },
    });
    buyerId = buyer.id;

    const provider = await prisma.user.create({
      data: { email: 'provider@test.com', password: hashedPassword, name: 'Provider', role: 'PROVIDER', tenantId: 'tenant-1' },
    });
    providerId = provider.id;

    adminToken = generateToken(jwtService, {
      sub: admin.id,
      email: admin.email,
      role: 'ADMIN',
      tenantId: 'tenant-1',
    });

    buyerToken = generateToken(jwtService, {
      sub: buyer.id,
      email: buyer.email,
      role: 'BUYER',
      tenantId: 'tenant-1',
    });
  });

  it('should return 409 for duplicate email (P2002)', async () => {
    // First registration
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'First',
        role: 'BUYER',
        tenantId: 'tenant-1',
      })
      .expect(201);

    // Duplicate registration - should get 409 from ConflictException
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'Second',
        role: 'BUYER',
        tenantId: 'tenant-1',
      })
      .expect(409);

    expect(res.body.message).toContain('already registered');
  });

  it('should return 404 for non-existent transaction (P2025 equivalent)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/transactions/${fakeId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should return 404 for non-existent user', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/users/${fakeId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(404);
  });

  it('should return 404 for non-existent dispute', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/disputes/${fakeId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(404);
  });

  it('should return 404 for non-existent payout', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await request(app.getHttpServer())
      .get(`/payouts/${fakeId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(404);
  });

  it('should return 409 for duplicate webhook idempotency key', async () => {
    await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .send({
        eventType: 'payment_intent.succeeded',
        payload: { id: 'pi_123' },
        idempotencyKey: 'evt_duplicate',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .send({
        eventType: 'payment_intent.succeeded',
        payload: { id: 'pi_123' },
        idempotencyKey: 'evt_duplicate',
      })
      .expect(409);

    expect(res.body.message).toContain('already processed');
  });

  it('should handle validation errors with 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: '123',
        name: '',
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('should reject extra fields with forbidNonWhitelisted', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        role: 'BUYER',
        tenantId: 'tenant-1',
        extraField: 'should not be here',
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});
