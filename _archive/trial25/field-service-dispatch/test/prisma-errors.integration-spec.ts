import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, generateToken } from './integration-setup';

describe('Prisma Error Handling (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let companyId: string;
  let customerId: string;

  beforeAll(async () => {
    const result = await createTestApp();
    app = result.app;
    prisma = result.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "work_order_status_history" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "job_photos" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "invoices" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "work_orders" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "routes" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "customers" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "technicians" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "companies" CASCADE`;

    const company = await prisma.company.create({
      data: { name: 'Error Test Co', slug: 'error-test-co' },
    });
    companyId = company.id;

    token = generateToken({
      sub: 'user-err',
      email: 'admin@error.com',
      role: 'ADMIN',
      companyId,
    });

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Error Cust', address: '999 Error St' },
    });
    customerId = customer.id;
  });

  it('should return 409 on duplicate company slug (P2002)', async () => {
    await prisma.company.create({
      data: { name: 'Dup Test', slug: 'dup-slug' },
    });

    const res = await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Another Dup', slug: 'dup-slug' })
      .expect(409);

    expect(res.body.statusCode).toBe(409);
    expect(res.body.message).toContain('Unique constraint');
  });

  it('should return 409 on duplicate technician email (P2002)', async () => {
    const uniqueEmail = `dup-tech-${Date.now()}@test.com`;

    await prisma.technician.create({
      data: {
        companyId,
        name: 'First Tech',
        email: uniqueEmail,
        skills: [],
      },
    });

    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ name: 'Second Tech', email: uniqueEmail })
      .expect(409);

    expect(res.body.statusCode).toBe(409);
    expect(res.body.error).toBe('Conflict');
  });

  it('should return 404 when work order not found (P2025 equivalent)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
    expect(res.body.message).toContain('not found');
  });

  it('should return 404 when customer not found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000001';

    const res = await request(app.getHttpServer())
      .get(`/customers/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 when technician not found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000002';

    const res = await request(app.getHttpServer())
      .get(`/technicians/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 when route not found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000003';

    const res = await request(app.getHttpServer())
      .get(`/routes/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 when company not found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000004';

    const res = await request(app.getHttpServer())
      .get(`/companies/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 when deleting non-existent work order', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000005';

    const res = await request(app.getHttpServer())
      .delete(`/work-orders/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 400 for validation errors (forbidNonWhitelisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({
        customerId,
        title: 'Valid WO',
        hackerField: 'should be rejected',
      })
      .expect(400);

    expect(res.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('hackerField'),
      ]),
    );
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({})
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('should return 409 on duplicate user email via auth register', async () => {
    const email = `dupreg-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'First User',
        companyId,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'password456',
        name: 'Second User',
        companyId,
      })
      .expect(409);

    expect(res.body.message).toContain('already registered');
  });

  it('should return 404 for invoice not found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000006';

    const res = await request(app.getHttpServer())
      .get(`/invoices/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });
});
