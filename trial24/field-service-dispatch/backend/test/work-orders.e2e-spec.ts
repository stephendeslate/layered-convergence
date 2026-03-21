import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('WorkOrders (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let companyId: string;
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
      data: { name: 'WO Test Company' },
    });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: { name: 'WO Test Customer', companyId },
    });
    customerId = customer.id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'wo-dispatcher@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        companyId,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wo-dispatcher@test.com', password: 'password123' });

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a work order', async () => {
    const response = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Fix HVAC',
        description: 'AC not working',
        customerId,
      })
      .expect(201);

    expect(response.body.title).toBe('Fix HVAC');
    expect(response.body.status).toBe('OPEN');
  });

  it('should list work orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should transition work order status', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Transition Test', customerId });

    const response = await request(app.getHttpServer())
      .patch(`/work-orders/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CANCELLED' })
      .expect(200);

    expect(response.body.status).toBe('CANCELLED');
  });

  it('should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/work-orders')
      .expect(401);
  });
});
