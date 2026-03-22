// TRACED:EM-TEST-01 auth integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration', () => {
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

  it('should reject registration with invalid role', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'ADMIN',
        tenantId: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.status).toBe(400);
  });

  it('should reject login with missing fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
  });

  it('should reject registration with long email', async () => {
    const longEmail = 'a'.repeat(256) + '@example.com';
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: longEmail,
        password: 'password123',
        role: 'BUYER',
        tenantId: '00000000-0000-0000-0000-000000000000',
      });

    expect(response.status).toBe(400);
  });

  it('should require authentication for protected endpoints', async () => {
    const response = await request(app.getHttpServer())
      .get('/listings?tenantId=test');

    expect(response.status).toBe(401);
  });
});
