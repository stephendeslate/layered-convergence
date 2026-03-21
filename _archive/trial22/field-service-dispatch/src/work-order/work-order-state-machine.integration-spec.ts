import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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

    const company = await prisma.company.create({
      data: { name: 'State Machine Co' },
    });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Customer A', address: '123 Main St' },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: {
        companyId,
        name: 'Tech A',
        email: 'tech-a@example.com',
        skills: ['plumbing'],
      },
    });
    technicianId = technician.id;
  });

  it('should create a work order with UNASSIGNED status', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({
        companyId,
        customerId,
        description: 'Fix sink',
      })
      .expect(201);

    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should create a work order with ASSIGNED status when technicianId provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('x-company-id', companyId)
      .send({
        companyId,
        customerId,
        technicianId,
        description: 'Fix sink',
      })
      .expect(201);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(technicianId);
  });

  it('should transition UNASSIGNED -> ASSIGNED via assign endpoint', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Fix sink' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(technicianId);
  });

  it('should walk through the full happy path: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Full path test' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/en-route`)
      .set('x-company-id', companyId)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/on-site`)
      .set('x-company-id', companyId)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/start`)
      .set('x-company-id', companyId)
      .expect(200);

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/complete`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.completedAt).toBeTruthy();
  });

  it('should reject invalid transitions with 400', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Invalid transition' },
    });

    // UNASSIGNED -> COMPLETED is not valid
    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject UNASSIGNED -> EN_ROUTE', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Bad transition' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/en-route`)
      .set('x-company-id', companyId)
      .expect(400);
  });

  it('should allow ASSIGNED -> UNASSIGNED (unassign)', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        description: 'Unassign test',
        status: 'ASSIGNED',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/unassign`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.status).toBe('UNASSIGNED');
    expect(res.body.technicianId).toBeNull();
  });

  it('should allow EN_ROUTE -> ASSIGNED (return to assigned)', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        description: 'Return test',
        status: 'EN_ROUTE',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/return-to-assigned`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should record status history on transitions', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'History test' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/assign`)
      .set('x-company-id', companyId)
      .send({ technicianId })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/work-orders/${wo.id}`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(res.body.statusHistory).toHaveLength(1);
    expect(res.body.statusHistory[0].fromStatus).toBe('UNASSIGNED');
    expect(res.body.statusHistory[0].toStatus).toBe('ASSIGNED');
  });

  it('should reject PAID -> any transition', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        description: 'Paid final test',
        status: 'PAID',
      },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'UNASSIGNED' })
      .expect(400);
  });

  it('should use transition endpoint with explicit status', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, description: 'Transition endpoint' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/transition`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED', technicianId })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should auto-assign nearest technician', async () => {
    const customer = await prisma.customer.create({
      data: {
        companyId,
        name: 'Geo Customer',
        address: '456 Oak Ave',
        lat: 40.7128,
        lng: -74.006,
      },
    });

    await prisma.technician.create({
      data: {
        companyId,
        name: 'Far Tech',
        email: 'far@example.com',
        skills: ['electric'],
        currentLat: 41.0,
        currentLng: -75.0,
      },
    });

    const nearTech = await prisma.technician.create({
      data: {
        companyId,
        name: 'Near Tech',
        email: 'near@example.com',
        skills: ['electric'],
        currentLat: 40.72,
        currentLng: -74.01,
      },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId, customerId: customer.id, description: 'Auto assign test' },
    });

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/auto-assign`)
      .set('x-company-id', companyId)
      .expect(201);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(nearTech.id);
  });
});
