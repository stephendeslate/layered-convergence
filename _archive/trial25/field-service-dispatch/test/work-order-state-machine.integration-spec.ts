import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, generateToken } from './integration-setup';

describe('Work Order State Machine (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

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

    const company = await prisma.company.create({
      data: { name: 'Test Co', slug: 'test-co-sm' },
    });
    companyId = company.id;

    token = generateToken({
      sub: 'user-1',
      email: 'admin@test.com',
      role: 'ADMIN',
      companyId,
    });

    const customer = await prisma.customer.create({
      data: {
        companyId,
        name: 'John Customer',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: {
        companyId,
        name: 'Jane Tech',
        email: `tech-sm-${Date.now()}@test.com`,
        skills: ['HVAC'],
        currentLat: 40.7228,
        currentLng: -74.016,
        status: 'AVAILABLE',
      },
    });
    technicianId = technician.id;
  });

  it('should create a work order in UNASSIGNED status', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({
        customerId,
        title: 'Fix AC unit',
      })
      .expect(201);

    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should transition UNASSIGNED -> ASSIGNED when assigning a technician', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        title: 'Fix heater',
        status: 'UNASSIGNED',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign/${technicianId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(technicianId);
  });

  it('should follow the full happy path: UNASSIGNED -> ... -> COMPLETED', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        title: 'Full path test',
        status: 'ASSIGNED',
      },
    });

    const transitions = [
      'EN_ROUTE',
      'ON_SITE',
      'IN_PROGRESS',
      'COMPLETED',
    ];

    for (const status of transitions) {
      const res = await request(app.getHttpServer())
        .patch(`/work-orders/${wo.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-company-id', companyId)
        .send({ status, note: `Transitioning to ${status}` })
        .expect(200);

      expect(res.body.status).toBe(status);
    }

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
      orderBy: { changedAt: 'asc' },
    });

    expect(history).toHaveLength(4);
    expect(history[0].fromStatus).toBe('ASSIGNED');
    expect(history[0].toStatus).toBe('EN_ROUTE');
    expect(history[3].fromStatus).toBe('IN_PROGRESS');
    expect(history[3].toStatus).toBe('COMPLETED');
  });

  it('should reject invalid transition UNASSIGNED -> EN_ROUTE', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        title: 'Invalid transition test',
        status: 'UNASSIGNED',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'EN_ROUTE' })
      .expect(400);

    expect(res.body.message).toContain('Invalid status transition');
  });

  it('should reject invalid transition COMPLETED -> ASSIGNED', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        title: 'Another invalid test',
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid status transition');
  });

  it('should reject invalid transition PAID -> anything', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        title: 'Paid terminal test',
        status: 'PAID',
        completedAt: new Date(),
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid status transition');
  });

  it('should allow backward transition ASSIGNED -> UNASSIGNED', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        title: 'Backward test',
        status: 'ASSIGNED',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'UNASSIGNED', note: 'Technician unavailable' })
      .expect(200);

    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should record status history with notes', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        title: 'History note test',
        status: 'ASSIGNED',
      },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'EN_ROUTE', note: 'Heading out now' })
      .expect(200);

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].note).toBe('Heading out now');
    expect(history[0].fromStatus).toBe('ASSIGNED');
    expect(history[0].toStatus).toBe('EN_ROUTE');
  });

  it('should set completedAt when transitioning to COMPLETED', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        title: 'CompletedAt test',
        status: 'IN_PROGRESS',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(200);

    const updated = await prisma.workOrder.findUnique({
      where: { id: wo.id },
    });
    expect(updated!.completedAt).not.toBeNull();
  });

  it('should auto-assign to nearest available technician', async () => {
    const farTech = await prisma.technician.create({
      data: {
        companyId,
        name: 'Far Tech',
        email: `fartech-${Date.now()}@test.com`,
        skills: ['plumbing'],
        currentLat: 41.0,
        currentLng: -75.0,
        status: 'AVAILABLE',
      },
    });

    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        title: 'Auto assign test',
        status: 'UNASSIGNED',
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/auto-assign`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(technicianId);
  });
});
