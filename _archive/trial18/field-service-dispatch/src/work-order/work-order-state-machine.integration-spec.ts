import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('WorkOrder State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

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

    const company = await prisma.company.create({
      data: { name: 'State Machine Co' },
    });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Test Customer', address: '123 Main St' },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: {
        companyId,
        name: 'Tech One',
        email: `tech-${Date.now()}@test.com`,
        skills: ['plumbing'],
      },
    });
    technicianId = technician.id;
  });

  async function createWorkOrder() {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        description: 'Test work order',
      },
    });
    return wo.id;
  }

  it('should walk through the full happy path: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED', async () => {
    const woId = await createWorkOrder();

    // UNASSIGNED -> ASSIGNED
    const r1 = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);
    expect(r1.body.status).toBe('ASSIGNED');
    expect(r1.body.technicianId).toBe(technicianId);

    // ASSIGNED -> EN_ROUTE
    const r2 = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/en-route`)
      .set('x-company-id', companyId)
      .expect(200);
    expect(r2.body.status).toBe('EN_ROUTE');

    // EN_ROUTE -> ON_SITE
    const r3 = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/on-site`)
      .set('x-company-id', companyId)
      .expect(200);
    expect(r3.body.status).toBe('ON_SITE');

    // ON_SITE -> IN_PROGRESS
    const r4 = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/start`)
      .set('x-company-id', companyId)
      .expect(200);
    expect(r4.body.status).toBe('IN_PROGRESS');

    // IN_PROGRESS -> COMPLETED
    const r5 = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/complete`)
      .set('x-company-id', companyId)
      .expect(200);
    expect(r5.body.status).toBe('COMPLETED');
    expect(r5.body.completedAt).toBeTruthy();
  });

  it('should allow ASSIGNED -> UNASSIGNED (unassign)', async () => {
    const woId = await createWorkOrder();

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/unassign`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.status).toBe('UNASSIGNED');
    expect(res.body.technicianId).toBeNull();
  });

  it('should allow EN_ROUTE -> ASSIGNED (reassign)', async () => {
    const woId = await createWorkOrder();

    const tech2 = await prisma.technician.create({
      data: {
        companyId,
        name: 'Tech Two',
        email: `tech2-${Date.now()}@test.com`,
        skills: ['electrical'],
      },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/en-route`)
      .set('x-company-id', companyId)
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/reassign`)
      .set('x-company-id', companyId)
      .send({ technicianId: tech2.id })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(tech2.id);
  });

  it('should reject invalid transition UNASSIGNED -> EN_ROUTE', async () => {
    const woId = await createWorkOrder();

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/en-route`)
      .set('x-company-id', companyId)
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject invalid transition ASSIGNED -> COMPLETED', async () => {
    const woId = await createWorkOrder();

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/complete`)
      .set('x-company-id', companyId)
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject transition from PAID (terminal state)', async () => {
    const woId = await createWorkOrder();

    // Walk to COMPLETED
    await prisma.workOrder.update({
      where: { id: woId },
      data: { status: 'COMPLETED', technicianId },
    });

    // COMPLETED -> INVOICED
    const inv = await prisma.invoice.create({
      data: { workOrderId: woId, amount: 100 },
    });
    await prisma.workOrder.update({
      where: { id: woId },
      data: { status: 'INVOICED' },
    });

    // INVOICED -> PAID
    await prisma.workOrder.update({
      where: { id: woId },
      data: { status: 'PAID' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should record status history for each transition', async () => {
    const woId = await createWorkOrder();

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/en-route`)
      .set('x-company-id', companyId)
      .expect(200);

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: woId },
      orderBy: { createdAt: 'asc' },
    });

    expect(history).toHaveLength(2);
    expect(history[0].fromStatus).toBe('UNASSIGNED');
    expect(history[0].toStatus).toBe('ASSIGNED');
    expect(history[1].fromStatus).toBe('ASSIGNED');
    expect(history[1].toStatus).toBe('EN_ROUTE');
  });

  it('should auto-assign nearest technician', async () => {
    const customer = await prisma.customer.create({
      data: {
        companyId,
        name: 'Located Customer',
        address: '456 Oak Ave',
        lat: 40.0,
        lng: -74.0,
      },
    });

    const farTech = await prisma.technician.create({
      data: {
        companyId,
        name: 'Far Tech',
        email: `far-${Date.now()}@test.com`,
        skills: ['plumbing'],
        currentLat: 41.0,
        currentLng: -75.0,
      },
    });

    const nearTech = await prisma.technician.create({
      data: {
        companyId,
        name: 'Near Tech',
        email: `near-${Date.now()}@test.com`,
        skills: ['plumbing'],
        currentLat: 40.01,
        currentLng: -74.01,
      },
    });

    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId: customer.id,
        description: 'Auto-assign test',
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/auto-assign`)
      .set('x-company-id', companyId)
      .expect(201);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(nearTech.id);
  });

  it('should reject auto-assign when no available technicians', async () => {
    // Set all technicians to BUSY
    await prisma.technician.updateMany({
      where: { companyId },
      data: { status: 'BUSY' },
    });

    const woId = await createWorkOrder();

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${woId}/auto-assign`)
      .set('x-company-id', companyId)
      .expect(400);

    expect(res.body.message).toContain('No available technicians');
  });

  it('should reject auto-assign when work order is not UNASSIGNED', async () => {
    const woId = await createWorkOrder();

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${woId}/auto-assign`)
      .set('x-company-id', companyId)
      .expect(400);

    expect(res.body.message).toContain('UNASSIGNED');
  });
});
