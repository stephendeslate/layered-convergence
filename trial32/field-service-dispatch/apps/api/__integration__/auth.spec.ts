// [TRACED:FD-TS-002] Integration test for auth endpoints
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import type { Server } from 'http';

describe('Auth (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    const company = await prisma.company.create({ data: { name: 'Test Company' } });
    companyId = company.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
    await app.close();
  });

  it('POST /auth/register should register a user', async () => {
    const httpServer = app.getHttpServer() as Server;
    const response = await request(httpServer)
      .post('/auth/register')
      .send({ email: 'int-test@test.com', password: 'password123', role: 'DISPATCHER', companyId })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('int-test@test.com');
  });

  it('POST /auth/register should reject ADMIN role', async () => {
    const httpServer = app.getHttpServer() as Server;
    await request(httpServer)
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'password123', role: 'ADMIN', companyId })
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
