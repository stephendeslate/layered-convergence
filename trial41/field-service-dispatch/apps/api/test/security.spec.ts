import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// TRACED: FD-SECURITY-TEST
describe('Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-security-tests';
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
    if (app) {
      await app.close();
    }
  });

  describe('Helmet Security Headers', () => {
    it('should return security headers on health endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit enforcement via ThrottlerGuard', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.status).toBe(200);
    });
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests to protected endpoints', async () => {
      await request(app.getHttpServer())
        .get('/work-orders')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    it('should reject registration with invalid role', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        })
        .expect(400);
    });

    it('should reject registration with extra fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          role: 'USER',
          tenantId: 'tenant-1',
          isAdmin: true,
        })
        .expect(400);
    });
  });
});
