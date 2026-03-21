import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, generateToken } from './integration-setup';

describe('Tenant / Company Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyAId: string;
  let companyBId: string;
  let tokenA: string;
  let tokenB: string;
  let customerAId: string;
  let customerBId: string;
  let techAId: string;
  let techBId: string;

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

    const companyA = await prisma.company.create({
      data: { name: 'Company A', slug: 'company-a' },
    });
    companyAId = companyA.id;

    const companyB = await prisma.company.create({
      data: { name: 'Company B', slug: 'company-b' },
    });
    companyBId = companyB.id;

    tokenA = generateToken({
      sub: 'user-a',
      email: 'admin@a.com',
      role: 'ADMIN',
      companyId: companyAId,
    });

    tokenB = generateToken({
      sub: 'user-b',
      email: 'admin@b.com',
      role: 'ADMIN',
      companyId: companyBId,
    });

    const custA = await prisma.customer.create({
      data: { companyId: companyAId, name: 'Cust A', address: '100 A St' },
    });
    customerAId = custA.id;

    const custB = await prisma.customer.create({
      data: { companyId: companyBId, name: 'Cust B', address: '200 B St' },
    });
    customerBId = custB.id;

    const tA = await prisma.technician.create({
      data: {
        companyId: companyAId,
        name: 'Tech A',
        email: `techa-${Date.now()}@test.com`,
        skills: ['HVAC'],
        status: 'AVAILABLE',
      },
    });
    techAId = tA.id;

    const tB = await prisma.technician.create({
      data: {
        companyId: companyBId,
        name: 'Tech B',
        email: `techb-${Date.now()}@test.com`,
        skills: ['plumbing'],
        status: 'AVAILABLE',
      },
    });
    techBId = tB.id;
  });

  it('should only return customers belonging to the requesting company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Cust A');

    const resB = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Cust B');
  });

  it('should only return technicians belonging to the requesting company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');
  });

  it('should not allow company A to access company B customer by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/customers/${customerBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should not allow company A to access company B technician by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/technicians/${techBId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should only return work orders belonging to the requesting company', async () => {
    await prisma.workOrder.create({
      data: {
        companyId: companyAId,
        customerId: customerAId,
        title: 'WO for A',
        status: 'UNASSIGNED',
      },
    });

    await prisma.workOrder.create({
      data: {
        companyId: companyBId,
        customerId: customerBId,
        title: 'WO for B',
        status: 'UNASSIGNED',
      },
    });

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].title).toBe('WO for A');
  });

  it('should not allow company A to view company B work order', async () => {
    const woB = await prisma.workOrder.create({
      data: {
        companyId: companyBId,
        customerId: customerBId,
        title: 'Secret WO',
        status: 'UNASSIGNED',
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${woB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(404);

    expect(res.body.message).toContain('not found');
  });

  it('should not allow company A to transition company B work order', async () => {
    const woB = await prisma.workOrder.create({
      data: {
        companyId: companyBId,
        customerId: customerBId,
        technicianId: techBId,
        title: 'Protected WO',
        status: 'ASSIGNED',
      },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${woB.id}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .send({ status: 'EN_ROUTE' })
      .expect(404);
  });

  it('should require x-company-id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should isolate routes by company', async () => {
    await prisma.route.create({
      data: {
        companyId: companyAId,
        technicianId: techAId,
        date: new Date('2025-01-15'),
        waypoints: [{ lat: 40.0, lng: -74.0 }],
        optimizedOrder: [0],
      },
    });

    await prisma.route.create({
      data: {
        companyId: companyBId,
        technicianId: techBId,
        date: new Date('2025-01-15'),
        waypoints: [{ lat: 41.0, lng: -75.0 }],
        optimizedOrder: [0],
      },
    });

    const resA = await request(app.getHttpServer())
      .get('/routes')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
  });

  it('should create work orders scoped to the company', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .send({
        customerId: customerAId,
        title: 'Scoped WO',
      })
      .expect(201);

    expect(res.body.companyId).toBe(companyAId);

    const all = await prisma.workOrder.findMany({
      where: { companyId: companyBId },
    });
    expect(all).toHaveLength(0);
  });
});
