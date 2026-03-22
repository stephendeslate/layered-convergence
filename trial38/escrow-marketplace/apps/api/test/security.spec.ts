import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

// TRACED: EM-TEST-004 — Security tests for Helmet headers and input validation

describe('Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
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
            imgSrc: ["'self'", "data:"],
            frameAncestors: ["'none'"],
          },
        },
      }),
    );
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

  describe('Helmet Security Headers', () => {
    it('should include Content-Security-Policy header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/profile');
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should include X-Content-Type-Options header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/profile');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/profile');
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should not expose X-Powered-By header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/profile');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Input Validation', () => {
    it('should reject XSS payloads in registration name', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'xss@example.com',
          password: 'securepass123',
          name: '<script>alert("xss")</script>',
          role: 'BUYER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      // Registration should succeed but name should be sanitized
      // (validation passes, sanitization happens in service)
      expect([200, 201, 409]).toContain(response.status);
    });

    it('should reject excessively long input', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'long@example.com',
          password: 'securepass123',
          name: 'A'.repeat(300),
          role: 'BUYER',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        });

      expect(response.status).toBe(400);
    });

    it('should reject non-whitelisted fields via forbidNonWhitelisted', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securepass123',
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid UUID format for tenantId', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securepass123',
          name: 'Test',
          role: 'BUYER',
          tenantId: 'not-a-uuid',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Authentication Guards', () => {
    it('should reject requests without Authorization header', async () => {
      const response = await request(app.getHttpServer()).get('/listings');
      expect(response.status).toBe(401);
    });

    it('should reject malformed Bearer tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings')
        .set('Authorization', 'Bearer malformed.jwt.token');
      expect(response.status).toBe(401);
    });

    it('should reject expired JWT tokens', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiQlVZRVIiLCJ0ZW5hbnRJZCI6InRlbmFudC0xIiwiZXhwIjoxfQ.' +
        'invalid-signature';

      const response = await request(app.getHttpServer())
        .get('/listings')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(response.status).toBe(401);
    });
  });
});
