import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('Company Context Auth Flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

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

    const company = await prisma.company.create({ data: { name: 'Auth Test Co' } });
    companyId = company.id;
  });

  describe('x-company-id header enforcement', () => {
    it('should return 400 when x-company-id header is missing on protected routes', async () => {
      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .expect(400);

      expect(res.body.message).toContain('x-company-id');
    });

    it('should return 400 when x-company-id header is missing for technicians', async () => {
      await request(app.getHttpServer())
        .get('/technicians')
        .expect(400);
    });

    it('should return 400 when x-company-id header is missing for customers', async () => {
      await request(app.getHttpServer())
        .get('/customers')
        .expect(400);
    });

    it('should accept request with valid x-company-id header', async () => {
      await request(app.getHttpServer())
        .get('/work-orders')
        .set('x-company-id', companyId)
        .expect(200);
    });
  });

  describe('company routes excluded from middleware', () => {
    it('should allow GET /companies without x-company-id', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should allow POST /companies without x-company-id', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send({ name: 'No Header Co' })
        .expect(201);

      expect(res.body.name).toBe('No Header Co');
    });

    it('should allow GET /companies/:id without x-company-id', async () => {
      await request(app.getHttpServer())
        .get(`/companies/${companyId}`)
        .expect(200);
    });

    it('should allow PATCH /companies/:id without x-company-id', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/companies/${companyId}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
    });

    it('should allow DELETE /companies/:id without x-company-id', async () => {
      const toDelete = await prisma.company.create({ data: { name: 'Delete Me' } });

      await request(app.getHttpServer())
        .delete(`/companies/${toDelete.id}`)
        .expect(200);
    });
  });

  describe('company context propagation', () => {
    it('should scope technician creation to the provided company', async () => {
      const res = await request(app.getHttpServer())
        .post('/technicians')
        .set('x-company-id', companyId)
        .send({
          companyId,
          name: 'Scoped Tech',
          email: 'scoped@example.com',
          skills: ['plumbing'],
        })
        .expect(201);

      expect(res.body.companyId).toBe(companyId);

      // Verify via GET with same company
      const list = await request(app.getHttpServer())
        .get('/technicians')
        .set('x-company-id', companyId)
        .expect(200);

      expect(list.body).toHaveLength(1);
    });

    it('should scope customer creation to the provided company', async () => {
      const res = await request(app.getHttpServer())
        .post('/customers')
        .set('x-company-id', companyId)
        .send({
          companyId,
          name: 'Scoped Customer',
          address: '100 Main St',
        })
        .expect(201);

      expect(res.body.companyId).toBe(companyId);
    });

    it('should scope work order listing to company context', async () => {
      const otherCompany = await prisma.company.create({ data: { name: 'Other Co' } });
      const otherCustomer = await prisma.customer.create({
        data: { companyId: otherCompany.id, name: 'Other Cust', address: '2 St' },
      });

      const myCustomer = await prisma.customer.create({
        data: { companyId, name: 'My Cust', address: '1 St' },
      });

      await prisma.workOrder.create({
        data: { companyId, customerId: myCustomer.id, description: 'Mine' },
      });
      await prisma.workOrder.create({
        data: { companyId: otherCompany.id, customerId: otherCustomer.id, description: 'Theirs' },
      });

      const res = await request(app.getHttpServer())
        .get('/work-orders')
        .set('x-company-id', companyId)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('Mine');
    });
  });

  describe('end-to-end auth flow', () => {
    it('should support full workflow: create company, create resources, query scoped data', async () => {
      // Step 1: Create company (no header needed)
      const compRes = await request(app.getHttpServer())
        .post('/companies')
        .send({ name: 'E2E Company' })
        .expect(201);

      const cId = compRes.body.id;

      // Step 2: Create technician (header required)
      const techRes = await request(app.getHttpServer())
        .post('/technicians')
        .set('x-company-id', cId)
        .send({
          companyId: cId,
          name: 'E2E Tech',
          email: 'e2e@example.com',
          skills: ['hvac'],
        })
        .expect(201);

      // Step 3: Create customer (header required)
      const custRes = await request(app.getHttpServer())
        .post('/customers')
        .set('x-company-id', cId)
        .send({
          companyId: cId,
          name: 'E2E Customer',
          address: '123 E2E St',
        })
        .expect(201);

      // Step 4: Create work order
      const woRes = await request(app.getHttpServer())
        .post('/work-orders')
        .set('x-company-id', cId)
        .send({
          companyId: cId,
          customerId: custRes.body.id,
          technicianId: techRes.body.id,
          description: 'E2E work order',
        })
        .expect(201);

      expect(woRes.body.status).toBe('ASSIGNED');

      // Step 5: Query scoped data
      const woList = await request(app.getHttpServer())
        .get('/work-orders')
        .set('x-company-id', cId)
        .expect(200);

      expect(woList.body).toHaveLength(1);
      expect(woList.body[0].id).toBe(woRes.body.id);
    });
  });
});
