// [TRACED:EM-TS-002] Integration test for auth endpoints
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import type { Server } from 'http';

describe('Auth (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    const tenant = await prisma.tenant.create({ data: { name: 'Test Tenant' } });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
    await app.close();
  });

  it('POST /auth/register should register a user', async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .post('/auth/register')
      .send({ email: 'int-test@test.com', password: 'password123', role: 'BUYER', tenantId })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('int-test@test.com');
  });

  it('POST /auth/register should reject ADMIN role', async () => {
    const httpServer = app.getHttpServer() as Server;
    await request(httpServer)
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'password123', role: 'ADMIN', tenantId })
      .expect(400);
  });

  it('POST /auth/login should return JWT', async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'int-test@test.com', password: 'password123' })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
  });

  it('POST /auth/login should reject invalid credentials', async () => {
    const httpServer = app.getHttpServer() as Server;
    await request(httpServer)
      .post('/auth/login')
      .send({ email: 'int-test@test.com', password: 'wrongpassword' })
      .expect(401);
  });
});
