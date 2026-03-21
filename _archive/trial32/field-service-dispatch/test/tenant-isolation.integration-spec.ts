import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, truncateDatabase, generateAuthToken } from './integration-setup';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let companyAId: string;
  let companyBId: string;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateDatabase(app);

    const companyA = await prisma.company.create({
      data: { name: 'Company A', slug: `a-${Date.now()}` },
    });
    companyAId = companyA.id;

    const companyB = await prisma.company.create({
      data: { name: 'Company B', slug: `b-${Date.now()}` },
    });
    companyBId = companyB.id;

    tokenA = generateAuthToken({
      id: 'user-a',
      email: 'a@test.com',
      role: 'ADMIN',
      companyId: companyAId,
    });

    tokenB = generateAuthToken({
      id: 'user-b',
      email: 'b@test.com',
      role: 'ADMIN',
      companyId: companyBId,
    });
  });

  it('should isolate technicians by company', async () => {
    await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .send({ name: 'Tech A', email: `tech-a-${Date.now()}@test.com` })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resB.body).toHaveLength(0);
  });

  it('should isolate customers by company', async () => {
    await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .send({ name: 'Customer A', address: '123 Main St' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resB.body).toHaveLength(0);
  });

  it('should isolate work orders by company', async () => {
    const customer = await prisma.customer.create({
      data: { companyId: companyAId, name: 'C', address: '456 St' },
    });

    await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .send({ customerId: customer.id, title: 'WO for A' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resB.body).toHaveLength(0);
  });

  it('should not allow access to another company technician by ID', async () => {
    const tech = await prisma.technician.create({
      data: {
        companyId: companyAId,
        name: 'Private Tech',
        email: `private-${Date.now()}@test.com`,
        skills: [],
      },
    });

    await request(app.getHttpServer())
      .get(`/technicians/${tech.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyBId)
      .expect(404);
  });

  it('should require x-company-id header', async () => {
    await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(400);
  });
});
