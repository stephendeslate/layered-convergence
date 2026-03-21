import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createApp, truncateAll } from './setup.js';

describe('Work Order State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    app = await createApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await truncateAll(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await truncateAll(prisma);

    const company = await prisma.company.create({
      data: { name: 'Test Co' },
    });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: {
        companyId,
        name: 'Jane Doe',
        address: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: {
        companyId,
        name: 'John Tech',
        email: `tech-${Date.now()}@test.com`,
        skills: ['plumbing'],
        currentLat: 40.758,
        currentLng: -73.9855,
      },
    });
    technicianId = technician.id;
  });

  it('should walk through the full state machine lifecycle', async () => {
    const server = app.getHttpServer();
    const headers = { 'x-company-id': companyId };

    const createRes = await request(server)
      .post('/work-orders')
      .set(headers)
      .send({
        companyId,
        customerId,
        description: 'Fix leaky faucet',
      })
      .expect(201);

    const woId = createRes.body.id;
    expect(createRes.body.status).toBe('UNASSIGNED');

    await request(server)
      .patch(`/work-orders/${woId}/assign`)
      .set(headers)
      .send({ technicianId })
      .expect(200);

    await request(server)
      .patch(`/work-orders/${woId}/en-route`)
      .set(headers)
      .expect(200);

    await request(server)
      .patch(`/work-orders/${woId}/on-site`)
      .set(headers)
      .expect(200);

    await request(server)
      .patch(`/work-orders/${woId}/start`)
      .set(headers)
      .expect(200);

    const completeRes = await request(server)
      .patch(`/work-orders/${woId}/complete`)
      .set(headers)
      .expect(200);

    expect(completeRes.body.status).toBe('COMPLETED');
    expect(completeRes.body.completedAt).toBeDefined();

    const invoiceRes = await request(server)
      .post(`/work-orders/${woId}/invoice`)
      .set(headers)
      .send({ amount: 150 })
      .expect(201);

    const invoiceId = invoiceRes.body.id;

    await request(server)
      .patch(`/invoices/${invoiceId}/pay`)
      .set(headers)
      .expect(200);

    const finalWo = await prisma.workOrder.findUnique({
      where: { id: woId },
      include: { statusHistory: true },
    });

    expect(finalWo!.status).toBe('PAID');
    expect(finalWo!.statusHistory).toHaveLength(7);
  });

  it('should reject invalid transitions', async () => {
    const server = app.getHttpServer();
    const headers = { 'x-company-id': companyId };

    const createRes = await request(server)
      .post('/work-orders')
      .set(headers)
      .send({ companyId, customerId, description: 'Test' })
      .expect(201);

    const woId = createRes.body.id;

    await request(server)
      .patch(`/work-orders/${woId}/complete`)
      .set(headers)
      .expect(400);

    await request(server)
      .patch(`/work-orders/${woId}/en-route`)
      .set(headers)
      .expect(400);
  });

  it('should support unassign flow', async () => {
    const server = app.getHttpServer();
    const headers = { 'x-company-id': companyId };

    const createRes = await request(server)
      .post('/work-orders')
      .set(headers)
      .send({ companyId, customerId, description: 'Test unassign' })
      .expect(201);

    const woId = createRes.body.id;

    await request(server)
      .patch(`/work-orders/${woId}/assign`)
      .set(headers)
      .send({ technicianId })
      .expect(200);

    const unassignRes = await request(server)
      .patch(`/work-orders/${woId}/unassign`)
      .set(headers)
      .expect(200);

    expect(unassignRes.body.status).toBe('UNASSIGNED');
    expect(unassignRes.body.technicianId).toBeNull();
  });

  it('should support auto-assign with haversine', async () => {
    const server = app.getHttpServer();
    const headers = { 'x-company-id': companyId };

    const createRes = await request(server)
      .post('/work-orders')
      .set(headers)
      .send({ companyId, customerId, description: 'Auto assign test' })
      .expect(201);

    const woId = createRes.body.id;

    const autoRes = await request(server)
      .post(`/work-orders/${woId}/auto-assign`)
      .set(headers)
      .expect(201);

    expect(autoRes.body.status).toBe('ASSIGNED');
    expect(autoRes.body.technicianId).toBe(technicianId);
  });
});
