import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Company Context Auth (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "Invoice", "WorkOrderStatusHistory", "WorkOrder", "Route", "Customer", "Technician", "Company" CASCADE',
    );
  });

  it('should reject requests without x-company-id header on tenant-scoped endpoints', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should reject requests without x-company-id on technicians endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/technicians')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should reject requests without x-company-id on customers endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/customers')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should allow company endpoints without x-company-id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/companies')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow creating a company without x-company-id header', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies')
      .send({ name: 'New Company' })
      .expect(201);

    expect(res.body.name).toBe('New Company');
    expect(res.body.id).toBeDefined();
  });

  it('should allow GET /companies/:id without x-company-id header', async () => {
    const company = await prisma.company.create({ data: { name: 'Get Test' } });

    const res = await request(app.getHttpServer())
      .get(`/companies/${company.id}`)
      .expect(200);

    expect(res.body.name).toBe('Get Test');
  });

  it('should accept valid x-company-id header on tenant-scoped endpoints', async () => {
    const company = await prisma.company.create({ data: { name: 'Valid Co' } });

    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', company.id)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject non-string x-company-id header', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', '')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should pass companyId through middleware to service layer', async () => {
    const company = await prisma.company.create({ data: { name: 'Pass Through' } });
    const customer = await prisma.customer.create({
      data: { companyId: company.id, name: 'Cust', address: '1 St' },
    });
    const tech = await prisma.technician.create({
      data: {
        companyId: company.id,
        name: 'Tech',
        email: `passthrough-${Date.now()}@test.com`,
        skills: ['plumbing'],
      },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId: company.id, customerId: customer.id, description: 'Test' },
    });

    // Should find it with correct company
    const res = await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set('x-company-id', company.id)
      .expect(200);

    expect(res.body.id).toBe(wo.id);
  });

  it('should use companyId from header, not from body, for listing', async () => {
    const coA = await prisma.company.create({ data: { name: 'A' } });
    const coB = await prisma.company.create({ data: { name: 'B' } });

    const custA = await prisma.customer.create({
      data: { companyId: coA.id, name: 'CA', address: '1' },
    });

    await prisma.workOrder.create({
      data: { companyId: coA.id, customerId: custA.id, description: 'A WO' },
    });

    // Request with company B header should NOT see company A work orders
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', coB.id)
      .expect(200);

    expect(res.body).toHaveLength(0);
  });

  it('should reject PATCH on tenant-scoped route without x-company-id', async () => {
    const res = await request(app.getHttpServer())
      .patch('/work-orders/some-id/assign')
      .send({ technicianId: 'some-tech' })
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should reject POST on tenant-scoped route without x-company-id', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders/some-id/auto-assign')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });
});
