import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  seedCompany,
  seedUser,
  generateToken,
} from './integration-setup';

describe('Prisma Error Handling (Integration)', () => {
  let app: INestApplication;
  let companyId: string;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const company = await seedCompany(app);
    companyId = company.id;
    const user = await seedUser(app, companyId);
    token = generateToken(user);
  });

  it('should return 409 for duplicate unique constraint (P2002)', async () => {
    const slug = `unique-${Date.now()}`;
    await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Company 1', slug })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Company 2', slug });

    expect(res.status).toBe(409);
    expect(res.body.statusCode).toBe(409);
  });

  it('should return 404 for non-existent record (findOne)', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent customer', async () => {
    const res = await request(app.getHttpServer())
      .get('/customers/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent technician', async () => {
    const res = await request(app.getHttpServer())
      .get('/technicians/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(404);
  });

  it('should handle duplicate user email registration', async () => {
    const email = `dup-${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'User 1',
        password: 'password123',
        companyId,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'User 2',
        password: 'password123',
        companyId,
      });

    expect(res.status).toBe(409);
  });
});
