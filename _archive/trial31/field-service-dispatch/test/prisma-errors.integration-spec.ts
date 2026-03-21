import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, truncateDatabase, generateAuthToken } from './integration-setup';

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
    await app.close();
  });

  beforeEach(async () => {
    await truncateDatabase(app);

    const company = await prisma.company.create({
      data: { name: 'Test Co', slug: `test-${Date.now()}` },
    });
    companyId = company.id;

    token = generateAuthToken({
      id: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      companyId,
    });
  });

  it('should return 409 for duplicate unique constraint (P2002)', async () => {
    const email = `dup-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ name: 'Tech 1', email })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ name: 'Tech 2', email })
      .expect(409);

    expect(res.body.statusCode).toBe(409);
    expect(res.body.error).toBe('Conflict');
  });

  it('should return 409 for duplicate company slug', async () => {
    const slug = `dup-slug-${Date.now()}`;

    await prisma.company.create({ data: { name: 'First', slug } });

    const res = await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Second', slug })
      .expect(409);

    expect(res.body.statusCode).toBe(409);
  });

  it('should return 404 for non-existent technician', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/technicians/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 for non-existent work order', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should return 404 for non-existent customer', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app.getHttpServer())
      .get(`/customers/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('should handle truncateAll correctly', async () => {
    await prisma.technician.create({
      data: { companyId, name: 'T', email: `t-${Date.now()}@test.com`, skills: [] },
    });

    await truncateDatabase(app);

    const count = await prisma.technician.count();
    expect(count).toBe(0);
  });
});
