import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED: EM-TEST-002 — Integration tests for auth endpoints

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
    it('should reject missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'securepass123',
          name: 'Test User',
          role: 'BUYER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
    });

    it('should reject ADMIN role registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'securepass123',
          name: 'Admin User',
          role: 'ADMIN',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
    });

    it('should strip unknown fields via whitelist validation', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securepass123',
          name: 'Test User',
          role: 'BUYER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject missing credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'noone@example.com',
          password: 'wrong',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return 401 without JWT token', async () => {
      const response = await request(app.getHttpServer()).get('/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid JWT token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
