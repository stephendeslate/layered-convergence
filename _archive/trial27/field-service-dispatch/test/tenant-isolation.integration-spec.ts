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

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let companyA: { id: string; slug: string };
  let companyB: { id: string; slug: string };
  let tokenA: string;
  let tokenB: string;
  let customerA: string;
  let customerB: string;
  let technicianA: string;

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

    companyA = await seedCompany(app, 'tenant-a', 'Tenant A');
    companyB = await seedCompany(app, 'tenant-b', 'Tenant B');

    tokenA = generateToken({
      id: 'user-a',
      email: 'admin-a@test.com',
      role: 'ADMIN',
      companyId: companyA.id,
    });

    tokenB = generateToken({
      id: 'user-b',
      email: 'admin-b@test.com',
      role: 'ADMIN',
      companyId: companyB.id,
    });

    const custA = await prisma.customer.create({
      data: {
        companyId: companyA.id,
        name: 'Customer A',
        address: '100 A Street',
      },
    });
    customerA = custA.id;

    const custB = await prisma.customer.create({
      data: {
        companyId: companyB.id,
        name: 'Customer B',
        address: '200 B Street',
      },
    });
    customerB = custB.id;

    const techA = await prisma.technician.create({
      data: {
        companyId: companyA.id,
        name: 'Tech A',
        email: `tech-a-${Date.now()}@test.com`,
        skills: ['electric'],
      },
    });
    technicianA = techA.id;
  });

  it('should only return work orders for the requesting company', async () => {
    await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id)
      .send({ customerId: customerA, title: 'WO for A' });

    await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id)
      .send({ customerId: customerB, title: 'WO for B' });

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id);

    expect(resA.status).toBe(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].title).toBe('WO for A');

    const resB = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].title).toBe('WO for B');
  });

  it('should not allow accessing another company work order by ID', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id)
      .send({ customerId: customerA, title: 'Private WO' });

    const woId = createRes.body.id;

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${woId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id);

    expect(res.status).toBe(404);
  });

  it('should not allow transitioning another company work order', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id)
      .send({ customerId: customerA, technicianId: technicianA, title: 'Isolated WO' });

    const woId = createRes.body.id;

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/status`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id)
      .send({ status: 'EN_ROUTE' });

    expect(res.status).toBe(404);
  });

  it('should isolate customers by company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Customer A');

    const resB = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Customer B');
  });

  it('should isolate technicians by company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');

    const resB = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyB.id);

    expect(resB.body).toHaveLength(0);
  });

  it('should require x-company-id header for company-scoped routes', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(400);
  });

  it('should not allow creating work orders with cross-company customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyA.id)
      .send({ customerId: customerB, title: 'Cross-company WO' });

    expect([400, 500]).toContain(res.status);
  });
});
