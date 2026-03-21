import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Customers (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

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
      data: { name: 'Customer Test Company' },
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'cust-e2e@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        companyId: company.id,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'cust-e2e@test.com', password: 'password123' });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /customers', () => {
    it('should create a customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme Corp', email: 'acme@test.com' })
        .expect(201);

      expect(response.body.name).toBe('Acme Corp');
    });
  });

  describe('GET /customers', () => {
    it('should list customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /customers/:id', () => {
    it('should update a customer', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Update Me' });

      const response = await request(app.getHttpServer())
        .patch(`/customers/${createRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should delete a customer', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Delete Me' });

      await request(app.getHttpServer())
        .delete(`/customers/${createRes.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
