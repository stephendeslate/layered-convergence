import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, truncateDatabase, generateAuthToken } from './integration-setup';

describe('Work Order State Machine (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let companyId: string;
  let customerId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateDatabase(app);

    const company = await prisma.company.create({
      data: { name: 'Test Co', slug: `test-${Date.now()}` },
    });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Jane Doe', address: '123 Main St', lat: 40.0, lng: -74.0 },
    });
    customerId = customer.id;

    token = generateAuthToken({
      id: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      companyId,
    });
  });

  it('should create work order with UNASSIGNED status', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, title: 'Fix sink' })
      .expect(201);

    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should transition UNASSIGNED -> ASSIGNED', async () => {
    const technician = await prisma.technician.create({
      data: { companyId, name: 'Bob', email: `bob-${Date.now()}@test.com`, skills: [] },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Test', status: 'UNASSIGNED', technicianId: technician.id },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED' })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should allow backward transition ASSIGNED -> UNASSIGNED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Test', status: 'ASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'UNASSIGNED' })
      .expect(200);

    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Test', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should create status history entry on transition', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Test', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED', note: 'Assigning to Bob' })
      .expect(200);

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe('UNASSIGNED');
    expect(history[0].toStatus).toBe('ASSIGNED');
    expect(history[0].note).toBe('Assigning to Bob');
  });

  it('should walk the full forward path', async () => {
    const tech = await prisma.technician.create({
      data: { companyId, name: 'Tech', email: `tech-${Date.now()}@test.com`, skills: [] },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Full path', status: 'UNASSIGNED', technicianId: tech.id },
    });

    const transitions = [
      'ASSIGNED',
      'EN_ROUTE',
      'ON_SITE',
      'IN_PROGRESS',
      'COMPLETED',
      'INVOICED',
      'PAID',
    ];

    for (const status of transitions) {
      await request(app.getHttpServer())
        .patch(`/work-orders/${wo.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-company-id', companyId)
        .send({ status })
        .expect(200);
    }

    const final = await prisma.workOrder.findUnique({ where: { id: wo.id } });
    expect(final?.status).toBe('PAID');

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
      orderBy: { changedAt: 'asc' },
    });
    expect(history).toHaveLength(7);
  });

  it('should auto-assign nearest technician', async () => {
    await prisma.technician.create({
      data: {
        companyId,
        name: 'Far Tech',
        email: `far-${Date.now()}@test.com`,
        skills: [],
        currentLat: 45.0,
        currentLng: -80.0,
        status: 'AVAILABLE',
      },
    });

    await prisma.technician.create({
      data: {
        companyId,
        name: 'Near Tech',
        email: `near-${Date.now()}@test.com`,
        skills: [],
        currentLat: 40.01,
        currentLng: -74.01,
        status: 'AVAILABLE',
      },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Auto assign test', status: 'UNASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/auto-assign`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(201);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technician.name).toBe('Near Tech');
  });
});
