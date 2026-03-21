import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Invoices (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let customerId: string;
  let workOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    const company = await prisma.company.create({
      data: { name: 'Invoice Test Company' },
    });

    const customer = await prisma.customer.create({
      data: { name: 'Invoice Customer', companyId: company.id },
    });
    customerId = customer.id;

    const workOrder = await prisma.workOrder.create({
      data: {
        title: 'Invoice WO',
        customerId,
        companyId: company.id,
        status: 'COMPLETED',
      },
    });
    workOrderId = workOrder.id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'inv-e2e@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        companyId: company.id,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'inv-e2e@test.com', password: 'password123' });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /invoices', () => {
    it('should create an invoice', async () => {
      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoiceNumber: 'INV-E2E-001',
          amount: 100.0,
          taxAmount: 10.0,
          totalAmount: 110.0,
          workOrderId,
          customerId,
        })
        .expect(201);

      expect(response.body.status).toBe('DRAFT');
    });
  });

  describe('GET /invoices', () => {
    it('should list invoices', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /invoices/:id/transition', () => {
    it('should transition invoice DRAFT -> SENT', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoiceNumber: 'INV-E2E-002',
          amount: 200.0,
          taxAmount: 20.0,
          totalAmount: 220.0,
          workOrderId,
          customerId,
        });

      const response = await request(app.getHttpServer())
        .patch(`/invoices/${createRes.body.id}/transition`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'SENT' })
        .expect(200);

      expect(response.body.status).toBe('SENT');
    });

    it('should reject invalid invoice transition', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invoiceNumber: 'INV-E2E-003',
          amount: 300.0,
          taxAmount: 30.0,
          totalAmount: 330.0,
          workOrderId,
          customerId,
        });

      await request(app.getHttpServer())
        .patch(`/invoices/${createRes.body.id}/transition`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'PAID' })
        .expect(409);
    });
  });
});
