import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  seedCompany,
  seedUser,
  generateToken,
} from './integration-setup';

describe('Work Order State Machine (Integration)', () => {
  let app: INestApplication;
  let companyId: string;
  let token: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const company = await seedCompany(app);
    companyId = company.id;
    const user = await seedUser(app, companyId);
    token = generateToken(user);

    const custRes = await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ name: 'Customer 1', email: 'cust@test.com', address: '123 Main St' });
    customerId = custRes.body.id;

    const techRes = await request(app.getHttpServer())
      .post('/technicians')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ name: 'Tech 1', email: 'tech@test.com', phone: '555-1234' });
    technicianId = techRes.body.id;
  });

  it('should create work order as UNASSIGNED', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({
        title: 'Fix AC',
        description: 'AC not working',
        customerId,
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('UNASSIGNED');
  });

  it('should create work order as ASSIGNED when technicianId provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({
        title: 'Fix AC',
        description: 'AC not working',
        customerId,
        technicianId,
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should follow the full happy path through all states', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({
        title: 'Full Path',
        description: 'Test',
        customerId,
        priority: 'MEDIUM',
      });
    const woId = createRes.body.id;

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign/${technicianId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .expect(200);

    const transitions = ['EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'COMPLETED'];
    for (const status of transitions) {
      const res = await request(app.getHttpServer())
        .patch(`/work-orders/${woId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-company-id', companyId)
        .send({ status });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(status);
    }
  });

  it('should reject invalid state transitions', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({
        title: 'Invalid Transition',
        description: 'Test',
        customerId,
        priority: 'LOW',
      });
    const woId = createRes.body.id;

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(400);
  });

  it('should record state history', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({
        title: 'History Test',
        description: 'Test',
        customerId,
        priority: 'MEDIUM',
      });
    const woId = createRes.body.id;

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/assign/${technicianId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    await request(app.getHttpServer())
      .patch(`/work-orders/${woId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId)
      .send({ status: 'EN_ROUTE' });

    const detailRes = await request(app.getHttpServer())
      .get(`/work-orders/${woId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(detailRes.body.statusHistory.length).toBeGreaterThanOrEqual(2);
  });
});
