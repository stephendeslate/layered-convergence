// TRACED: EM-TEST-004 — Auth integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Integration (E2E)', () => {
  let app: INestApplication;
  let prismaService: {
    user: { findFirst: jest.Mock; create: jest.Mock };
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    onModuleInit: jest.Mock;
    onModuleDestroy: jest.Mock;
  };

  beforeAll(async () => {
    prismaService = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
    };

    process.env.JWT_SECRET = 'test-integration-secret-key';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
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
    if (app) await app.close();
  });

  describe('POST /auth/register', () => {
    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'securepass123',
          name: 'Admin',
          role: 'ADMIN',
          tenantId: 'tenant-001',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
    });

    it('should reject registration with extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'securepass123',
          name: 'Test',
          role: 'BUYER',
          tenantId: 'tenant-001',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', tenantId: 'tenant-001' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
