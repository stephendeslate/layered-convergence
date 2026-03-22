// TRACED:AE-TEST-06 — Security tests with supertest for HTTP assertions
// TRACED:AE-SEC-04 — Verifies Helmet CSP headers and CORS

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

describe('Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'security-test-secret-key-value';
    process.env.CORS_ORIGIN = 'http://localhost:3001';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            frameAncestors: ["'none'"],
          },
        },
      }),
    );

    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

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

  describe('Security Headers', () => {
    it('should set Content-Security-Policy header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/health')
        .expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should not expose X-Powered-By header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/health')
        .expect(200);

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Input Validation', () => {
    it('should reject oversized email in registration', async () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: longEmail,
          password: 'Pass123!',
          displayName: 'Test',
          role: 'EDITOR',
          tenantId: 'tenant-1',
        })
        .expect(400);
    });

    it('should reject unknown properties', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Pass123!',
          maliciousField: 'drop table users;',
        })
        .expect(400);
    });
  });

  describe('Authentication', () => {
    it('should return 401 for protected endpoints without token', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });

    it('should return 401 for invalid bearer token', async () => {
      await request(app.getHttpServer())
        .get('/pipelines')
        .set('Authorization', 'Bearer forged-token-value')
        .expect(401);
    });
  });
});
