// [TRACED:FD-TS-003] Integration test for work-order endpoints
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import type { Server } from 'http';

describe('WorkOrder (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    const company = await prisma.company.create({ data: { name: 'WO Test Company' } });

    const httpServer = app.getHttpServer() as Server;

    await request(httpServer)
      .post('/auth/register')
      .send({ email: 'wo-test@test.com', password: 'password123', role: 'DISPATCHER', companyId: company.id });

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'wo-test@test.com', password: 'password123' });

    accessToken = loginResponse.body.accessToken as string;
  });

  afterAll(async () => {
    await prisma.workOrder.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
    await app.close();
  });

  it('GET /work-orders should require auth', async () => {
    const httpServer = app.getHttpServer() as Server;
    await request(httpServer)
      .get('/work-orders')
      .expect(401);
  });

  it('GET /work-orders should return work orders with auth', async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .get('/work-orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
