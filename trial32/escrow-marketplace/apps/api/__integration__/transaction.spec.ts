// [TRACED:EM-TS-003] Integration test for transaction endpoints
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import type { Server } from 'http';

describe('Transaction (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    const tenant = await prisma.tenant.create({ data: { name: 'Test Tenant TX' } });
    tenantId = tenant.id;

    const httpServer = app.getHttpServer() as Server;
    await request(httpServer)
      .post('/auth/register')
      .send({ email: 'tx-test@test.com', password: 'password123', role: 'BUYER', tenantId });

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'tx-test@test.com', password: 'password123' });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
    await app.close();
  });

  it('GET /transactions should require authentication', async () => {
    const httpServer = app.getHttpServer() as Server;
    await request(httpServer)
      .get('/transactions')
      .expect(401);
  });

  it('GET /transactions should return transactions with auth', async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .get('/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
