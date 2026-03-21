import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  truncateDatabase,
  generateAuthToken,
} from './integration-setup';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Prisma Error Handling (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;
  let authToken: string;

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
      data: { name: 'Test Co', slug: 'test-co-prisma' },
    });
    companyId = company.id;

    authToken = generateAuthToken({
      id: 'user-1', email: 'admin@test.com', role: 'ADMIN', companyId,
    });
  });

  it('should return 409 for unique constraint violation (P2002)', async () => {
    await prisma.company.create({
      data: { name: 'Dupe Co', slug: 'dupe-slug' },
    });

    await request(app.getHttpServer())
      .post('/companies')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Another Co', slug: 'dupe-slug' })
      .expect(409);
  });

  it('should return 409 for duplicate technician email', async () => {
    await prisma.technician.create({
      data: { companyId, name: 'Tech 1', email: 'dupe@test.com' },
    });

    await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-company-id', companyId)
      .send({ name: 'Tech 2', email: 'dupe@test.com' })
      .expect(409);
  });

  it('should return 404 for non-existent records', async () => {
    await request(app.getHttpServer())
      .get('/work-orders/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-company-id', companyId)
      .expect(404);
  });

  it('should return 404 for non-existent company', async () => {
    await request(app.getHttpServer())
      .get('/companies/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('should handle foreign key constraint violations for work orders', async () => {
    await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-company-id', companyId)
      .send({
        customerId: '00000000-0000-0000-0000-000000000000',
        title: 'Bad FK',
      })
      .expect(400);
  });
});
