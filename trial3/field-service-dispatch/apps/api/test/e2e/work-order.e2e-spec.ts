import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/app.module';

describe('WorkOrder E2E — Tenant Isolation', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyA: { id: string };
  let companyB: { id: string };
  let customerA: { id: string };
  let workOrderByA: { id: string; trackingToken: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Create two companies (tenants)
    companyA = await prisma.company.create({ data: { name: 'Company A' } });
    companyB = await prisma.company.create({ data: { name: 'Company B' } });

    // Create a customer for Company A
    customerA = await prisma.customer.create({
      data: {
        companyId: companyA.id,
        name: 'Customer A',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.0060,
      },
    });

    // Create a work order for Company A
    workOrderByA = await prisma.workOrder.create({
      data: {
        companyId: companyA.id,
        customerId: customerA.id,
        description: 'Fix HVAC unit',
        serviceType: 'HVAC',
      },
    });
  });

  afterAll(async () => {
    await prisma.workOrderStatusHistory.deleteMany({});
    await prisma.workOrder.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.technician.deleteMany({});
    await prisma.company.deleteMany({});
    await app.close();
  });

  it('should allow Company A to access its own work order', async () => {
    const response = await request(app.getHttpServer())
      .get(`/work-orders/${workOrderByA.id}`)
      .set('x-company-id', companyA.id)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(workOrderByA.id);
    expect(response.body.companyId).toBe(companyA.id);
  });

  // [VERIFY:TENANT_ISOLATION] Cross-tenant access must return 404
  it('should return 404 when Company B tries to access Company A work order', async () => {
    await request(app.getHttpServer())
      .get(`/work-orders/${workOrderByA.id}`)
      .set('x-company-id', companyB.id)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return empty list when Company B lists work orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyB.id)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual([]);
  });

  // Cross-tenant assignment must fail
  it('should return 404 when Company B tries to assign Company A work order', async () => {
    await request(app.getHttpServer())
      .post(`/work-orders/${workOrderByA.id}/assign`)
      .set('x-company-id', companyB.id)
      .send({ technicianId: 'any-tech-id' })
      .expect(HttpStatus.NOT_FOUND);
  });

  // Cross-tenant status transition must fail
  it('should return 404 when Company B tries to transition Company A work order', async () => {
    await request(app.getHttpServer())
      .post(`/work-orders/${workOrderByA.id}/transition`)
      .set('x-company-id', companyB.id)
      .send({ toStatus: 'ASSIGNED' })
      .expect(HttpStatus.NOT_FOUND);
  });

  // Static route: stats should scope to company
  it('should return stats scoped to the requesting company', async () => {
    const responseA = await request(app.getHttpServer())
      .get('/work-orders/stats')
      .set('x-company-id', companyA.id)
      .expect(HttpStatus.OK);

    expect(responseA.body.total).toBe(1);

    const responseB = await request(app.getHttpServer())
      .get('/work-orders/stats')
      .set('x-company-id', companyB.id)
      .expect(HttpStatus.OK);

    expect(responseB.body.total).toBe(0);
  });

  // Static route: tracking token is public (no tenant scope needed)
  it('should allow public tracking by token', async () => {
    const response = await request(app.getHttpServer())
      .get(`/work-orders/tracking/${workOrderByA.trackingToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(workOrderByA.id);
  });
});
