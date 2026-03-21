import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  truncateDatabase,
  generateAuthToken,
} from './integration-setup';
import { PrismaService } from '../src/prisma/prisma.service';

describe('WorkOrder State Machine (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

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
      data: { name: 'Test Co', slug: 'test-co-sm' },
    });
    companyId = company.id;

    authToken = generateAuthToken({
      id: 'user-1',
      email: 'admin@test.com',
      role: 'ADMIN',
      companyId,
    });

    const customer = await prisma.customer.create({
      data: { companyId, name: 'Customer 1', address: '123 Main St', lat: 40.0, lng: -74.0 },
    });
    customerId = customer.id;

    const technician = await prisma.technician.create({
      data: { companyId, name: 'Tech 1', email: 'tech1@test.com', status: 'AVAILABLE', currentLat: 40.0, currentLng: -74.0 },
    });
    technicianId = technician.id;
  });

  it('should follow the full happy path: UNASSIGNED -> ASSIGNED -> ... -> PAID', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Test WO', status: 'UNASSIGNED' },
    });

    const transitions = [
      'ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID',
    ];

    let currentId = wo.id;
    for (const status of transitions) {
      const res = await request(app.getHttpServer())
        .patch(`/work-orders/${currentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-company-id', companyId)
        .send({ status })
        .expect(200);

      expect(res.body.status).toBe(status);
    }
  });

  it('should reject invalid status transitions', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Test WO', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should allow backward transitions', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, technicianId, title: 'Test WO', status: 'ASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-company-id', companyId)
      .send({ status: 'UNASSIGNED' })
      .expect(200);

    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should create status history records', async () => {
    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Test WO', status: 'UNASSIGNED' },
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-company-id', companyId)
      .send({ status: 'ASSIGNED', note: 'Assigning tech' })
      .expect(200);

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe('UNASSIGNED');
    expect(history[0].toStatus).toBe('ASSIGNED');
    expect(history[0].note).toBe('Assigning tech');
  });

  it('should auto-assign nearest technician', async () => {
    await prisma.technician.create({
      data: {
        companyId, name: 'Tech 2', email: 'tech2@test.com',
        status: 'AVAILABLE', currentLat: 41.0, currentLng: -75.0,
      },
    });

    const wo = await prisma.workOrder.create({
      data: { companyId, customerId, title: 'Auto Assign WO', status: 'UNASSIGNED' },
    });

    const res = await request(app.getHttpServer())
      .post(`/work-orders/${wo.id}/auto-assign`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-company-id', companyId)
      .expect(201);

    expect(res.body.status).toBe('ASSIGNED');
    expect(res.body.technicianId).toBe(technicianId);
  });
});
