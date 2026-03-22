// TRACED:AE-TEST-04 — Auth integration tests with supertest

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'integration-test-secret-key';
    process.env.CORS_ORIGIN = 'http://localhost:3001';

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
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /auth/health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /auth/register', () => {
    it('should reject registration with ADMIN role', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'SecurePassword1!',
          displayName: 'Admin Attempt',
          role: 'ADMIN',
          tenantId: '00000000-0000-0000-0000-000000000001',
        })
        .expect(400);
    });

    it('should reject registration with missing fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'partial@test.com' })
        .expect(400);
    });

    it('should reject non-whitelisted fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'Pass123!',
          displayName: 'Test',
          role: 'EDITOR',
          tenantId: 'tenant-1',
          isAdmin: true,
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com' })
        .expect(400);
    });
  });
});
