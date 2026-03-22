// TRACED:EM-SEC-09 security integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should return 401 for unauthenticated requests to protected endpoints', async () => {
    const response = await request(app.getHttpServer()).get('/listings?tenantId=test');
    expect(response.status).toBe(401);
  });

  it('should strip unknown fields from request body', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        maliciousField: 'should-be-stripped',
      });
    // Should not cause 500 — either 400 (stripped and validated) or 401 (not found)
    expect([400, 401]).toContain(response.status);
  });

  it('should reject oversized UUID fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'BUYER',
        tenantId: 'x'.repeat(100),
      });
    expect(response.status).toBe(400);
  });

  it('should set security headers', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.headers).toHaveProperty('x-content-type-options');
  });

  it('should reject ADMIN role in registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@evil.com',
        password: 'password123',
        role: 'ADMIN',
        tenantId: '00000000-0000-0000-0000-000000000000',
      });
    expect(response.status).toBe(400);
  });
});
