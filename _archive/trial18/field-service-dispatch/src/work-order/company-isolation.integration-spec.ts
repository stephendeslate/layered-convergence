import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('Company Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let companyAId: string;
  let companyBId: string;
  let customerAId: string;
  let customerBId: string;
  let techAId: string;
  let techBId: string;

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

    const companyA = await prisma.company.create({ data: { name: 'Company A' } });
    const companyB = await prisma.company.create({ data: { name: 'Company B' } });
    companyAId = companyA.id;
    companyBId = companyB.id;

    const custA = await prisma.customer.create({
      data: { companyId: companyAId, name: 'Customer A', address: '1 A St' },
    });
    const custB = await prisma.customer.create({
      data: { companyId: companyBId, name: 'Customer B', address: '1 B St' },
    });
    customerAId = custA.id;
    customerBId = custB.id;

    const tA = await prisma.technician.create({
      data: {
        companyId: companyAId,
        name: 'Tech A',
        email: `techA-${Date.now()}@test.com`,
        skills: ['plumbing'],
      },
    });
    const tB = await prisma.technician.create({
      data: {
        companyId: companyBId,
        name: 'Tech B',
        email: `techB-${Date.now()}@test.com`,
        skills: ['hvac'],
      },
    });
    techAId = tA.id;
    techBId = tB.id;
  });

  it('should only list work orders belonging to the requesting company', async () => {
    await prisma.workOrder.create({
      data: { companyId: companyAId, customerId: customerAId, description: 'WO for A' },
    });
    await prisma.workOrder.create({
      data: { companyId: companyBId, customerId: customerBId, description: 'WO for B' },
    });

    const resA = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].description).toBe('WO for A');

    const resB = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].description).toBe('WO for B');
  });

  it('should return 404 when accessing another company work order by ID', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId: companyAId, customerId: customerAId, description: 'Private' },
    });

    await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set('x-company-id', companyBId)
      .expect(404);
  });

  it('should only list technicians belonging to the requesting company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Tech A');

    const resB = await request(app.getHttpServer())
      .get('/technicians')
      .set('x-company-id', companyBId)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Tech B');
  });

  it('should return 404 when accessing another company technician', async () => {
    await request(app.getHttpServer())
      .get(`/technicians/${techAId}`)
      .set('x-company-id', companyBId)
      .expect(404);
  });

  it('should only list customers belonging to the requesting company', async () => {
    const resA = await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', companyAId)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Customer A');
  });

  it('should return 404 when accessing another company customer', async () => {
    await request(app.getHttpServer())
      .get(`/customers/${customerAId}`)
      .set('x-company-id', companyBId)
      .expect(404);
  });

  it('should not allow assigning a work order from another company', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId: companyAId, customerId: customerAId, description: 'A only' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyBId)
      .send({ technicianId: techBId })
      .expect(404);
  });

  it('should not allow transitioning a work order from another company', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId: companyAId, customerId: customerAId, description: 'A WO' },
    });

    await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: 'ASSIGNED', technicianId: techAId },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/en-route`)
      .set('x-company-id', companyBId)
      .expect(404);
  });

  it('should isolate auto-assign to same-company technicians', async () => {
    const customer = await prisma.customer.create({
      data: {
        companyId: companyAId,
        name: 'Located A',
        address: '789 Main',
        lat: 40.0,
        lng: -74.0,
      },
    });

    await prisma.technician.update({
      where: { id: techAId },
      data: { currentLat: 40.01, currentLng: -74.01 },
    });

    // Company B tech is closer but should NOT be picked
    await prisma.technician.update({
      where: { id: techBId },
      data: { currentLat: 40.001, currentLng: -74.001 },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId: companyAId, customerId: customer.id, description: 'Auto test' },
    });

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/auto-assign`)
      .set('x-company-id', companyAId)
      .expect(201);

    expect(res.body.technicianId).toBe(techAId);
  });
});
