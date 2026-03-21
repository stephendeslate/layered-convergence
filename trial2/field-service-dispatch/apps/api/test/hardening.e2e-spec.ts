import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, registerCompany, TestCompany } from './test-utils';

describe('Hardening E2E Tests', () => {
  let app: INestApplication;
  let companyA: TestCompany;
  let companyB: TestCompany;

  beforeAll(async () => {
    app = await createTestApp();
    await cleanDatabase(app);

    companyA = await registerCompany(app, {
      companyName: 'Alpha Corp',
      email: 'admin@alpha.com',
      password: 'password123',
      firstName: 'Alpha',
      lastName: 'Admin',
    });

    companyB = await registerCompany(app, {
      companyName: 'Beta Corp',
      email: 'admin@beta.com',
      password: 'password123',
      firstName: 'Beta',
      lastName: 'Admin',
    });
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  describe('Full Work Order Lifecycle (UNASSIGNED -> PAID)', () => {
    let customerId: string;
    let technicianId: string;
    let workOrderId: string;
    let invoiceId: string;

    it('should create a customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          name: 'Lifecycle Customer',
          address: '100 Main St, Austin TX',
          lat: 30.27,
          lng: -97.74,
        })
        .expect(201);
      customerId = res.body.id;
      expect(customerId).toBeDefined();
    });

    it('should create a technician', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/technicians')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          name: 'Lifecycle Tech',
          email: 'lifecycle-tech@alpha.com',
          skills: ['electrical'],
          hourlyRate: 90,
        })
        .expect(201);
      technicianId = res.body.id;
      expect(technicianId).toBeDefined();
    });

    it('should create a work order (UNASSIGNED)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId,
          title: 'Full lifecycle test',
          serviceType: 'electrical',
          address: '100 Main St',
          lat: 30.27,
          lng: -97.74,
        })
        .expect(201);
      workOrderId = res.body.id;
      expect(res.body.status).toBe('UNASSIGNED');
      expect(res.body.trackingToken).toBeDefined();
    });

    it('should assign work order (UNASSIGNED -> ASSIGNED)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/assign`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ technicianId })
        .expect(201);
      expect(res.body.status).toBe('ASSIGNED');
      expect(res.body.technicianId).toBe(technicianId);
    });

    it('should transition ASSIGNED -> EN_ROUTE', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'EN_ROUTE' })
        .expect(201);
      expect(res.body.status).toBe('EN_ROUTE');
    });

    it('should transition EN_ROUTE -> ON_SITE', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'ON_SITE' })
        .expect(201);
      expect(res.body.status).toBe('ON_SITE');
    });

    it('should transition ON_SITE -> IN_PROGRESS', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'IN_PROGRESS' })
        .expect(201);
      expect(res.body.status).toBe('IN_PROGRESS');
      expect(res.body.startedAt).toBeDefined();
    });

    it('should transition IN_PROGRESS -> COMPLETED', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'COMPLETED' })
        .expect(201);
      expect(res.body.status).toBe('COMPLETED');
      expect(res.body.completedAt).toBeDefined();
    });

    it('should create invoice (COMPLETED -> INVOICED)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          workOrderId,
          amount: 200,
          tax: 16.5,
          description: 'Electrical repair',
        })
        .expect(201);
      invoiceId = res.body.id;
      expect(res.body.invoiceNumber).toMatch(/^INV-/);
      expect(parseFloat(res.body.total)).toBeCloseTo(216.50, 2);

      const woRes = await request(app.getHttpServer())
        .get(`/api/work-orders/${workOrderId}`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);
      expect(woRes.body.status).toBe('INVOICED');
    });

    it('should mark invoice as paid (INVOICED -> PAID)', async () => {
      await request(app.getHttpServer())
        .post(`/api/invoices/${invoiceId}/mark-paid`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(201);

      const woRes = await request(app.getHttpServer())
        .get(`/api/work-orders/${workOrderId}`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);
      expect(woRes.body.status).toBe('PAID');
    });

    it('should have complete status history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/work-orders/${workOrderId}/history`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      const statuses = res.body.map((h: { toStatus: string }) => h.toStatus);
      expect(statuses).toContain('UNASSIGNED');
      expect(statuses).toContain('ASSIGNED');
      expect(statuses).toContain('EN_ROUTE');
      expect(statuses).toContain('ON_SITE');
      expect(statuses).toContain('IN_PROGRESS');
      expect(statuses).toContain('COMPLETED');
      expect(statuses).toContain('INVOICED');
      expect(statuses).toContain('PAID');
    });
  });

  describe('Tenant Isolation - Work Orders', () => {
    let companyAWorkOrderId: string;
    let companyBWorkOrderId: string;

    beforeAll(async () => {
      const custA = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Iso Customer A', address: '1 A St' })
        .expect(201);

      const custB = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyB.token}`)
        .send({ name: 'Iso Customer B', address: '1 B St' })
        .expect(201);

      const woA = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId: custA.body.id,
          title: 'WO for Company A',
          serviceType: 'plumbing',
          address: '1 A St',
          lat: 30.0,
          lng: -97.0,
        })
        .expect(201);
      companyAWorkOrderId = woA.body.id;

      const woB = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyB.token}`)
        .send({
          customerId: custB.body.id,
          title: 'WO for Company B',
          serviceType: 'plumbing',
          address: '1 B St',
          lat: 31.0,
          lng: -97.0,
        })
        .expect(201);
      companyBWorkOrderId = woB.body.id;
    });

    it('Company A cannot see Company B work orders in list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      const ids = res.body.map((wo: { id: string }) => wo.id);
      expect(ids).not.toContain(companyBWorkOrderId);
    });

    it('Company B cannot see Company A work orders in list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/work-orders')
        .set('Authorization', `Bearer ${companyB.token}`)
        .expect(200);

      const ids = res.body.map((wo: { id: string }) => wo.id);
      expect(ids).not.toContain(companyAWorkOrderId);
    });

    it('Company A cannot access Company B work order by ID', async () => {
      await request(app.getHttpServer())
        .get(`/api/work-orders/${companyBWorkOrderId}`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(404);
    });

    it('Company B cannot access Company A work order by ID', async () => {
      await request(app.getHttpServer())
        .get(`/api/work-orders/${companyAWorkOrderId}`)
        .set('Authorization', `Bearer ${companyB.token}`)
        .expect(404);
    });
  });

  describe('Tenant Isolation - Technicians', () => {
    let companyATechId: string;
    let companyBTechId: string;

    beforeAll(async () => {
      const techA = await request(app.getHttpServer())
        .post('/api/technicians')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          name: 'Iso Tech A',
          email: 'iso-tech-a@alpha.com',
          skills: ['hvac'],
          hourlyRate: 70,
        })
        .expect(201);
      companyATechId = techA.body.id;

      const techB = await request(app.getHttpServer())
        .post('/api/technicians')
        .set('Authorization', `Bearer ${companyB.token}`)
        .send({
          name: 'Iso Tech B',
          email: 'iso-tech-b@beta.com',
          skills: ['hvac'],
          hourlyRate: 70,
        })
        .expect(201);
      companyBTechId = techB.body.id;
    });

    it('Company A cannot see Company B technicians', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/technicians')
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      const ids = res.body.map((t: { id: string }) => t.id);
      expect(ids).not.toContain(companyBTechId);
    });

    it('Company B cannot see Company A technicians', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/technicians')
        .set('Authorization', `Bearer ${companyB.token}`)
        .expect(200);

      const ids = res.body.map((t: { id: string }) => t.id);
      expect(ids).not.toContain(companyATechId);
    });

    it('Company A cannot access Company B technician by ID', async () => {
      await request(app.getHttpServer())
        .get(`/api/technicians/${companyBTechId}`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(404);
    });
  });

  describe('Tenant Isolation - Customers', () => {
    let companyACustId: string;
    let companyBCustId: string;

    beforeAll(async () => {
      const custA = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Tenant Cust A', address: '10 A Rd' })
        .expect(201);
      companyACustId = custA.body.id;

      const custB = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyB.token}`)
        .send({ name: 'Tenant Cust B', address: '10 B Rd' })
        .expect(201);
      companyBCustId = custB.body.id;
    });

    it('Company A cannot access Company B customer by ID', async () => {
      await request(app.getHttpServer())
        .get(`/api/customers/${companyBCustId}`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(404);
    });

    it('Company B cannot access Company A customer by ID', async () => {
      await request(app.getHttpServer())
        .get(`/api/customers/${companyACustId}`)
        .set('Authorization', `Bearer ${companyB.token}`)
        .expect(404);
    });
  });

  describe('Auth - JWT Enforcement', () => {
    it('should return 401 for no JWT on protected endpoint', async () => {
      await request(app.getHttpServer())
        .get('/api/work-orders')
        .expect(401);
    });

    it('should return 401 for invalid JWT', async () => {
      await request(app.getHttpServer())
        .get('/api/work-orders')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);
    });

    it('should return 200 for valid JWT on protected endpoint', async () => {
      await request(app.getHttpServer())
        .get('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);
    });

    it('should allow public endpoints without JWT', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@alpha.com', password: 'password123' })
        .expect(201);
    });

    it('should return 401 for unauthenticated profile access', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('Invalid State Transitions', () => {
    let workOrderId: string;

    beforeAll(async () => {
      const cust = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Invalid Trans Customer', address: '99 Z St' })
        .expect(201);

      const wo = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId: cust.body.id,
          title: 'Invalid transition test',
          serviceType: 'plumbing',
          address: '99 Z St',
          lat: 30.0,
          lng: -97.0,
        })
        .expect(201);
      workOrderId = wo.body.id;
    });

    it('should reject UNASSIGNED -> COMPLETED (skip states)', async () => {
      await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'COMPLETED' })
        .expect(400);
    });

    it('should reject UNASSIGNED -> EN_ROUTE (skip assign)', async () => {
      await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'EN_ROUTE' })
        .expect(400);
    });

    it('should reject UNASSIGNED -> IN_PROGRESS', async () => {
      await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'IN_PROGRESS' })
        .expect(400);
    });

    it('should reject UNASSIGNED -> PAID', async () => {
      await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'PAID' })
        .expect(400);
    });

    it('should reject UNASSIGNED -> INVOICED', async () => {
      await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'INVOICED' })
        .expect(400);
    });
  });

  describe('Route Optimization', () => {
    it('should create a route with valid data', async () => {
      const cust = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Route Customer', address: '50 Route Dr' })
        .expect(201);

      const tech = await request(app.getHttpServer())
        .post('/api/technicians')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          name: 'Route Tech',
          email: 'route-tech@alpha.com',
          skills: ['general'],
          hourlyRate: 60,
        })
        .expect(201);

      const wo1 = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId: cust.body.id,
          title: 'Route WO 1',
          serviceType: 'general',
          address: '50 Route Dr',
          lat: 30.27,
          lng: -97.74,
        })
        .expect(201);

      const wo2 = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId: cust.body.id,
          title: 'Route WO 2',
          serviceType: 'general',
          address: '60 Route Dr',
          lat: 30.28,
          lng: -97.75,
        })
        .expect(201);

      const routeRes = await request(app.getHttpServer())
        .post('/api/routes')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          technicianId: tech.body.id,
          date: '2026-04-01',
          workOrderIds: [wo1.body.id, wo2.body.id],
        })
        .expect(201);

      expect(routeRes.body.id).toBeDefined();
      expect(routeRes.body.waypoints).toHaveLength(2);
      expect(routeRes.body.optimizedOrder).toEqual([0, 1]);
    });
  });

  describe('Input Validation', () => {
    it('should reject technician creation with no skills', async () => {
      await request(app.getHttpServer())
        .post('/api/technicians')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          name: 'No Skills Tech',
          email: 'noskills@alpha.com',
          skills: [],
          hourlyRate: 50,
        })
        .expect(400);
    });

    it('should reject work order with out-of-range lat', async () => {
      const cust = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Validation Customer', address: '1 Valid St' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId: cust.body.id,
          title: 'Bad lat',
          serviceType: 'plumbing',
          address: '1 Valid St',
          lat: 999,
          lng: -97,
        })
        .expect(400);
    });

    it('should reject work order with out-of-range lng', async () => {
      const cust = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Validation Customer 2', address: '2 Valid St' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId: cust.body.id,
          title: 'Bad lng',
          serviceType: 'plumbing',
          address: '2 Valid St',
          lat: 30,
          lng: 999,
        })
        .expect(400);
    });

    it('should reject duplicate email registration', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          companyName: 'Duplicate Co',
          email: 'admin@alpha.com',
          password: 'password123',
          firstName: 'Dup',
          lastName: 'User',
        })
        .expect(409);
    });

    it('should reject invoice for non-completed work order', async () => {
      const cust = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Invoice Val Cust', address: '5 Invoice St' })
        .expect(201);

      const wo = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId: cust.body.id,
          title: 'Not completed yet',
          serviceType: 'plumbing',
          address: '5 Invoice St',
          lat: 30.0,
          lng: -97.0,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          workOrderId: wo.body.id,
          amount: 100,
        });

      expect([400, 404]).toContain(res.status);
    });
  });

  describe('Dispatch Board', () => {
    it('should return dispatch board with stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dispatch/board')
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      expect(res.body.workOrders).toBeDefined();
      expect(Array.isArray(res.body.workOrders)).toBe(true);
      expect(res.body.technicians).toBeDefined();
      expect(Array.isArray(res.body.technicians)).toBe(true);
      expect(res.body.stats).toBeDefined();
      expect(typeof res.body.stats.total).toBe('number');
    });
  });

  describe('Tracking Token (Public Access)', () => {
    it('should access work order via tracking token without auth', async () => {
      const cust = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Tracking Customer', address: '7 Track St' })
        .expect(201);

      const wo = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId: cust.body.id,
          title: 'Tracking test',
          serviceType: 'plumbing',
          address: '7 Track St',
          lat: 30.0,
          lng: -97.0,
        })
        .expect(201);

      expect(wo.body.trackingToken).toBeDefined();

      const woDetail = await request(app.getHttpServer())
        .get(`/api/work-orders/${wo.body.id}`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      const trackingToken = woDetail.body.trackingToken;
      expect(trackingToken).toBeDefined();

      const res = await request(app.getHttpServer())
        .get(`/api/work-orders/tracking/${trackingToken}`)
        .expect(200);

      expect(res.body.id).toBe(wo.body.id);
    });

    it('should return empty result for invalid tracking token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/work-orders/tracking/nonexistent-token')
        .expect(200);

      expect(res.body.id).toBeUndefined();
    });
  });
});
