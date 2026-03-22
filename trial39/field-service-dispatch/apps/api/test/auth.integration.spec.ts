// TRACED: FD-TEST-004 — Auth integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
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

    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password12345',
          role: 'ADMIN',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'short',
          role: 'DISPATCHER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password12345',
          role: 'DISPATCHER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login without required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without bearer token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid bearer token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
