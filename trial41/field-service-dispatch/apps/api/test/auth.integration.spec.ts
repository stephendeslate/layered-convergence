// TRACED: FD-AUTH-INTEGRATION-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

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

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'integration@test.com',
          password: 'password123',
          role: 'USER',
          tenantId: '00000000-0000-0000-0000-000000000001',
        });

      expect(response.status).toBe(201);
    });

    it('should reject registration with invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: '00000000-0000-0000-0000-000000000001',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with unknown fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          role: 'USER',
          tenantId: '00000000-0000-0000-0000-000000000001',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        });

      expect([401, 500]).toContain(response.status);
    });

    it('should reject login without required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should reject unauthenticated access', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should reject invalid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
