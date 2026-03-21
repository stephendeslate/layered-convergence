import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, registerCompany, TestCompany } from './test-utils';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Field Service Dispatch E2E', () => {
  let app: INestApplication;
  let companyA: TestCompany;
  let companyB: TestCompany;

  beforeAll(async () => {
    app = await createTestApp();
    await cleanDatabase(app);

    companyA = await registerCompany(app, {
      companyName: 'Company A',
      email: 'admin@company-a.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'A',
    });

    companyB = await registerCompany(app, {
      companyName: 'Company B',
      email: 'admin@company-b.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'B',
    });
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  describe('Auth', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@company-a.com', password: 'password123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe('admin@company-a.com');
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@company-a.com', password: 'wrong' })
        .expect(401);
    });

    it('should get current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      expect(res.body.email).toBe('admin@company-a.com');
      expect(res.body.companyId).toBe(companyA.companyId);
    });

    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('Tenant Isolation', () => {
    let companyACustomerId: string;
    let companyBCustomerId: string;

    beforeAll(async () => {
      const resA = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ name: 'Customer A', address: '123 A St' })
        .expect(201);
      companyACustomerId = resA.body.id;

      const resB = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyB.token}`)
        .send({ name: 'Customer B', address: '456 B St' })
        .expect(201);
      companyBCustomerId = resB.body.id;
    });

    it('Company A should only see its own customers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Customer A');
    });

    it('Company B should only see its own customers', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${companyB.token}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Customer B');
    });

    it("Company A cannot access Company B's customer by ID", async () => {
      await request(app.getHttpServer())
        .get(`/api/customers/${companyBCustomerId}`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(404);
    });
  });

  describe('Work Order Lifecycle', () => {
    let customerId: string;
    let technicianId: string;
    let workOrderId: string;

    beforeAll(async () => {
      const prisma = app.get(PrismaService);

      const customer = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          name: 'Lifecycle Customer',
          address: '789 Test Ave, Austin TX',
          lat: 30.27,
          lng: -97.74,
        })
        .expect(201);
      customerId = customer.body.id;

      const tech = await request(app.getHttpServer())
        .post('/api/technicians')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          name: 'Test Tech',
          email: 'tech-lifecycle@test.com',
          skills: ['plumbing'],
          hourlyRate: 75,
        })
        .expect(201);
      technicianId = tech.body.id;
    });

    it('should create a work order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          customerId,
          title: 'Fix pipe',
          serviceType: 'plumbing',
          address: '789 Test Ave',
          lat: 30.27,
          lng: -97.74,
        })
        .expect(201);

      workOrderId = res.body.id;
      expect(res.body.status).toBe('UNASSIGNED');
      expect(res.body.trackingToken).toBeDefined();
    });

    it('should assign to technician', async () => {
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

    it('should reject invalid transition', async () => {
      await request(app.getHttpServer())
        .post(`/api/work-orders/${workOrderId}/transition`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ toStatus: 'ASSIGNED' })
        .expect(400);
    });

    it('should have status history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/work-orders/${workOrderId}/history`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThanOrEqual(5);
    });

    it('should create an invoice for completed work order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          workOrderId,
          amount: 150,
          tax: 12.38,
          description: 'Pipe repair service',
        })
        .expect(201);

      expect(res.body.invoiceNumber).toMatch(/^INV-/);
      expect(res.body.total).toBe('162.38');
    });

    it('should access work order by tracking token', async () => {
      const wo = await request(app.getHttpServer())
        .get(`/api/work-orders/${workOrderId}`)
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/work-orders/tracking/${wo.body.trackingToken}`)
        .expect(200);

      expect(res.body.id).toBe(workOrderId);
    });
  });

  describe('Technicians', () => {
    it('should create a technician', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/technicians')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({
          name: 'New Tech',
          email: 'newtech@test.com',
          skills: ['hvac', 'electrical'],
          hourlyRate: 80,
        })
        .expect(201);

      expect(res.body.name).toBe('New Tech');
      expect(res.body.skills).toEqual(['hvac', 'electrical']);
    });

    it('should list available technicians', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/technicians/available')
        .set('Authorization', `Bearer ${companyA.token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should reject work order with missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/work-orders')
        .set('Authorization', `Bearer ${companyA.token}`)
        .send({ title: 'Missing fields' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with short password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          companyName: 'Test',
          email: 'test@test.com',
          password: 'short',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should reject non-whitelisted properties', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin@company-a.com',
          password: 'password123',
          malicious: 'extra-field',
        })
        .expect(400);
    });
  });
});
