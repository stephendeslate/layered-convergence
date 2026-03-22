// TRACED:AE-AUTH-INTEGRATION-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should reject registration without required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          name: 'Admin Attempt',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with unknown fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-1',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login without credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        });

      expect([401, 500]).toContain(response.status);
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
