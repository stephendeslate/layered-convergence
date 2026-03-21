import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Invoices (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let workOrderId: string;
  let customerId: string;

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

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'inv-dispatcher@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        companyId: company.id,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'inv-dispatcher@test.com', password: 'password123' });

    token = loginRes.body.access_token;

    const woRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Invoice WO', customerId });

    workOrderId = woRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create an invoice', async () => {
    const response = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        invoiceNumber: 'INV-001',
        amount: 500,
        taxAmount: 50,
        totalAmount: 550,
        workOrderId,
        customerId,
      })
      .expect(201);

    expect(response.body.invoiceNumber).toBe('INV-001');
    expect(response.body.status).toBe('DRAFT');
  });

  it('should list invoices', async () => {
    const response = await request(app.getHttpServer())
      .get('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should transition invoice status', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        invoiceNumber: 'INV-002',
        amount: 200,
        taxAmount: 20,
        totalAmount: 220,
        workOrderId,
        customerId,
      });

    const response = await request(app.getHttpServer())
      .patch(`/invoices/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'SENT' })
      .expect(200);

    expect(response.body.status).toBe('SENT');
  });
});
