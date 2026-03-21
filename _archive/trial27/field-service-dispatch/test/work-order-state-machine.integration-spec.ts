import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  generateToken,
  cleanDatabase,
  seedCompany,
} from './integration-setup';

describe('Work Order State Machine (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);

    const company = await seedCompany(app, 'state-test');
    companyId = company.id;

    token = generateToken({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'ADMIN',
      companyId,
    });

    const customer = await prisma.customer.create({
      data: {
        companyId,
        name: 'Test Customer',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: {
        companyId,
        name: 'Test Tech',
        email: `tech-${Date.now()}@test.com`,
        skills: ['plumbing'],
        currentLat: 40.7128,
        currentLng: -74.006,
        status: 'AVAILABLE',
      },
    });
    technicianId = technician.id;
  });

  it('should create work order as UNASSIGNED when no technician', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, title: 'Fix sink' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('UNASSIGNED');
    expect(res.body.technicianId).toBeNull();
  });

  it('should create work order as ASSIGNED when technician provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, technicianId, title: 'Fix sink' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(technicianId);
  });

  it('should transition through the full lifecycle', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, technicianId, title: 'Full lifecycle' });

    const woId = createRes.body.id;
    expect(createRes.body.status).toBe('ASSIGNED');

    const transitions = [
      'EN_ROUTE',
      'ON_SITE',
      'IN_PROGRESS',
      'COMPLETED',
    ];

    for (const status of transitions) {
      const res = await request(app.getHttpServer())
        .patch(`/work-orders/${woId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-company-id', companyId)
        .send({ status });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(status);
    }

    const detail = await request(app.getHttpServer())
      .get(`/work-orders/${woId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(detail.body.status).toBe('COMPLETED');
    expect(detail.body.statusHistory.length).toBeGreaterThanOrEqual(4);
  });

  it('should reject invalid transitions', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, title: 'Invalid transition test' });

    const woId = createRes.body.id;

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(400);
  });

  it('should support backward transitions', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, technicianId, title: 'Backward test' });

    const woId = createRes.body.id;

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'EN_ROUTE' });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should not allow transition from PAID', async () => {
    const wo = await prisma.workOrder.create({
      data: {
        companyId,
        customerId,
        technicianId,
        title: 'Paid order',
        status: 'PAID',
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(400);
  });

  it('should record status history on each transition', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, technicianId, title: 'History test' });

    const woId = createRes.body.id;

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'EN_ROUTE', note: 'Heading out' });

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'ON_SITE' });

    const detail = await request(app.getHttpServer())
      .get(`/work-orders/${woId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(detail.body.statusHistory.length).toBe(2);
    const latestHistory = detail.body.statusHistory[0];
    expect(latestHistory.fromStatus).toBe('EN_ROUTE');
    expect(latestHistory.toStatus).toBe('ON_SITE');
  });

  it('should assign technician and change status to ASSIGNED', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, title: 'Assign test' });

    const woId = createRes.body.id;
    expect(createRes.body.status).toBe('UNASSIGNED');

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign/${technicianId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(technicianId);
  });

  it('should auto-assign to nearest available technician', async () => {
    const closeTech = await prisma.technician.create({
      data: {
        companyId,
        name: 'Close Tech',
        email: `close-${Date.now()}@test.com`,
        skills: ['plumbing'],
        currentLat: 40.7129,
        currentLng: -74.0061,
        status: 'AVAILABLE',
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
        status: 'AVAILABLE',
      },
    });

    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ customerId, title: 'Auto-assign test' });

    const woId = createRes.body.id;

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${woId}/auto-assign`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(closeTech.id);
  });
});
