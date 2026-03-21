import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  truncateDatabase,
  generateAuthToken,
} from './integration-setup';
import { PrismaService } from '../src/prisma/prisma.service';

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
      data: { name: 'Company A', slug: 'company-a' },
    });
    companyAId = companyA.id;

    const companyB = await prisma.company.create({
      data: { name: 'Company B', slug: 'company-b' },
    });
    companyBId = companyB.id;

    tokenA = generateAuthToken({
      id: 'user-a', email: 'a@test.com', role: 'ADMIN', companyId: companyAId,
    });
    tokenB = generateAuthToken({
      id: 'user-b', email: 'b@test.com', role: 'ADMIN', companyId: companyBId,
    });
  });

  it('should isolate customers between companies', async () => {
    await prisma.customer.create({
      data: { companyId: companyAId, name: 'Customer A', address: '123 A St' },
    });
    await prisma.customer.create({
      data: { companyId: companyBId, name: 'Customer B', address: '456 B St' },
    });

    const resA = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Customer A');

    const resB = await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Customer B');
  });

  it('should isolate technicians between companies', async () => {
    await prisma.technician.create({
      data: { companyId: companyAId, name: 'Tech A', email: 'techa@test.com' },
    });
    await prisma.technician.create({
      data: { companyId: companyBId, name: 'Tech B', email: 'techb@test.com' },
    });

    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');
  });

  it('should prevent cross-tenant access to work orders', async () => {
    const customer = await prisma.customer.create({
      data: { companyId: companyAId, name: 'Customer A', address: '123 A St' },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId: companyAId, customerId: customer.id, title: 'WO A' },
    });

    await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyBId)
      .expect(404);
  });

  it('should require x-company-id header on tenant-scoped routes', async () => {
    await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(400);
  });

  it('should isolate routes between companies', async () => {
    const techA = await prisma.technician.create({
      data: { companyId: companyAId, name: 'Tech A', email: 'routetecha@test.com' },
    });

    await prisma.route.create({
      data: {
        companyId: companyAId,
        technicianId: techA.id,
        date: new Date('2026-03-20'),
        waypoints: [{ lat: 40.0, lng: -74.0 }],
        optimizedOrder: [0],
      },
    });

    const resB = await request(app.getHttpServer())
      .get('/routes')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resB.body).toHaveLength(0);
  });
});
