import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  generateToken,
  cleanDatabase,
  seedCompany,
} from './integration-setup';

describe('Prisma Error Handling (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let companyId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);

    const company = await seedCompany(app, 'prisma-err-test');
    companyId = company.id;

    token = generateToken({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'ADMIN',
      companyId,
    });
  });

  it('should return 409 for duplicate unique constraint (P2002) - company slug', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate', slug: 'prisma-err-test' });

    expect(res.status).toBe(409);
    expect(res.body.statusCode).toBe(409);
    expect(res.body.message).toBeDefined();
  });

  it('should return 409 for duplicate technician email (P2002)', async () => {
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
      .send({
        name: 'Second Tech',
        email: uniqueEmail,
        skills: [],
      });

    expect(res.status).toBe(409);
    expect(res.body.statusCode).toBe(409);
  });

  it('should return 404 for non-existent work order (P2025 / NotFoundException)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent company', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/companies/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent customer', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/customers/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent technician', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/technicians/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(404);
  });

  it('should handle foreign key violation when creating work order with invalid customerId', async () => {
    const fakeCustomerId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId: fakeCustomerId, title: 'Bad FK' });

    expect([400, 500]).toContain(res.status);
  });

  it('should return 409 for duplicate user email via auth register', async () => {
    const email = `dup-user-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'First User',
        companyId,
      });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'password456',
        name: 'Second User',
        companyId,
      });

    expect(res.status).toBe(409);
  });

  it('should return 400 for invalid request body (ValidationPipe)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for unknown properties (forbidNonWhitelisted)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'valid@test.com',
        password: 'pass',
        name: 'Test',
        companyId,
        unknownField: 'should-be-rejected',
      });

    expect(res.status).toBe(400);
  });
});
