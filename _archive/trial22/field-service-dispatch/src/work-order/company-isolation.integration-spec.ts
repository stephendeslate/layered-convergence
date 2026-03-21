import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Company Isolation / Tenant Context (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyA: string;
  let companyB: string;
  let customerA: string;
  let customerB: string;
  let techA: string;
  let techB: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE "Invoice", "WorkOrderStatusHistory", "WorkOrder", "Route", "Technician", "Customer", "Company" CASCADE`;

    const a = await prisma.company.create({ data: { name: 'Company A' } });
    companyA = a.id;
    const b = await prisma.company.create({ data: { name: 'Company B' } });
    companyB = b.id;

    const cA = await prisma.customer.create({
      data: { companyId: companyA, name: 'Cust A', address: '1 A St' },
    });
    customerA = cA.id;

    const cB = await prisma.customer.create({
      data: { companyId: companyB, name: 'Cust B', address: '1 B St' },
    });
    customerB = cB.id;

    const tA = await prisma.technician.create({
      data: {
        companyId: companyA,
        name: 'Tech A',
        email: 'tech-a@a.com',
        skills: ['plumbing'],
      },
    });
    techA = tA.id;

    const tB = await prisma.technician.create({
      data: {
        companyId: companyB,
        name: 'Tech B',
        email: 'tech-b@b.com',
        skills: ['electric'],
      },
    });
    techB = tB.id;
  });

  it('should only return work orders for the requesting company', async () => {
    await prisma.workOrder.create({
      data: { companyId: companyA, customerId: customerA, description: 'WO for A' },
    });
    await prisma.workOrder.create({
      data: { companyId: companyB, customerId: customerB, description: 'WO for B' },
    });

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyA)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].description).toBe('WO for A');

    const resB = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyB)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].description).toBe('WO for B');
  });

  it('should not allow company A to view company B work order by id', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId: companyB, customerId: customerB, description: 'Secret WO' },
    });

    await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set('x-company-id', companyA)
      .expect(404);
  });

  it('should not allow company A to transition company B work order', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId: companyB, customerId: customerB, description: 'Cross tenant' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyA)
      .send({ technicianId: techA })
      .expect(404);
  });

  it('should only return technicians for the requesting company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyA)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');
  });

  it('should not allow company A to view company B technician', async () => {
    await request(app.getHttpServer())
      .get(`/technicians/${techB}`)
      .set('x-company-id', companyA)
      .expect(404);
  });

  it('should only return customers for the requesting company', async () => {
    const resB = await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', companyB)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Cust B');
  });

  it('should not allow company B to view company A customer', async () => {
    await request(app.getHttpServer())
      .get(`/customers/${customerA}`)
      .set('x-company-id', companyB)
      .expect(404);
  });

  it('should allow company routes without x-company-id header', async () => {
    await request(app.getHttpServer())
      .get('/companies')
      .expect(200);
  });

  it('should create company without x-company-id header', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .send({ name: 'New Company' })
      .expect(201);

    expect(res.body.name).toBe('New Company');
  });

  it('should isolate auto-assign to same company technicians only', async () => {
    // Set tech B as far away, and tech A as close
    await prisma.technician.update({
      where: { id: techA },
      data: { currentLat: 40.71, currentLng: -74.0 },
    });
    await prisma.technician.update({
      where: { id: techB },
      data: { currentLat: 40.72, currentLng: -74.01 },
    });

    const customerWithGeo = await prisma.customer.create({
      data: {
        companyId: companyA,
        name: 'Geo Cust',
        address: '789 St',
        lat: 40.71,
        lng: -74.0,
      },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId: companyA, customerId: customerWithGeo.id, description: 'Isolated auto' },
    });

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/auto-assign`)
      .set('x-company-id', companyA)
      .expect(201);

    // Should assign tech A (same company), not tech B (different company)
    expect(res.body.technicianId).toBe(techA);
  });
});
