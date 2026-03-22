import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED: EM-TEST-002 — Integration tests with real AppModule and supertest

describe('Auth Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject registration with invalid email via POST /auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
        name: 'Test User',
        role: 'BUYER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

    expect(response.status).toBe(400);
  });

  it('should reject registration with ADMIN role via POST /auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin',
        role: 'ADMIN',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

    expect(response.status).toBe(400);
  });

  it('should reject registration with short password via POST /auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'short',
        name: 'Test',
        role: 'BUYER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

    expect(response.status).toBe(400);
  });

  it('should reject login with missing fields via POST /auth/login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({});

    expect(response.status).toBe(400);
  });

  it('should reject registration with extra fields via POST /auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'BUYER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        isAdmin: true,
      });

    expect(response.status).toBe(400);
  });

  it('should return 401 for unauthenticated profile request via GET /auth/profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile');

    expect(response.status).toBe(401);
  });

  it('should return health check via GET /auth/health', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should reject non-whitelisted properties in login via POST /auth/login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        extraField: 'injected',
      });

    expect(response.status).toBe(400);
  });
});
