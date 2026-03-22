// TRACED: FD-TEST-006 — Security tests for Helmet, rate limiting, input validation
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { sanitizeInput, maskSensitive } from '@field-service-dispatch/shared';

describe('Security', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          frameAncestors: ["'none'"],
        },
      },
    }));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Helmet headers', () => {
    it('should set Content-Security-Policy header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me');

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me');

      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should not expose X-Powered-By header', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Input validation', () => {
    it('should reject registration with email exceeding max length', async () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: longEmail, password: 'password123', role: 'DISPATCHER', tenantId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(response.status).toBe(400);
    });

    it('should reject registration with password exceeding max length', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'a'.repeat(129), role: 'DISPATCHER', tenantId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(response.status).toBe(400);
    });

    it('should reject registration with password below min length', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'short', role: 'DISPATCHER', tenantId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(response.status).toBe(400);
    });
  });

  describe('sanitizeInput', () => {
    it('should strip HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should handle strings without HTML', () => {
      expect(sanitizeInput('plain text')).toBe('plain text');
    });
  });

  describe('maskSensitive', () => {
    it('should mask all but last 4 characters by default', () => {
      expect(maskSensitive('test@example.com')).toBe('************.com');
    });

    it('should mask with custom visible characters', () => {
      expect(maskSensitive('secret123', 3)).toBe('******123');
    });

    it('should mask entirely when value is shorter than visible chars', () => {
      expect(maskSensitive('ab', 4)).toBe('**');
    });
  });
});
