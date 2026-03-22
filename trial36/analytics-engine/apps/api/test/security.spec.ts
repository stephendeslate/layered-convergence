// TRACED: AE-TEST-003
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Security', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
            imgSrc: ["'self'", 'data:'],
            frameAncestors: ["'none'"],
          },
        },
      }),
    );
    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Helmet Headers', () => {
    it('should set Content-Security-Policy header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');
      const csp = response.headers['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('should remove X-Powered-By header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers in response', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      const rateLimitHeaders = [
        'x-ratelimit-limit',
        'x-ratelimit-remaining',
      ];
      const hasRateLimitHeader = rateLimitHeaders.some(
        (header) => response.headers[header] !== undefined,
      );
      expect(hasRateLimitHeader).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should reject email exceeding max length', async () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: longEmail,
          password: 'password123',
          name: 'Test',
          role: 'ANALYST',
          tenantSlug: 'acme',
        });

      expect(response.status).toBe(400);
    });

    it('should reject name exceeding max length', async () => {
      const longName = 'A'.repeat(101);
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: longName,
          role: 'ANALYST',
          tenantSlug: 'acme',
        });

      expect(response.status).toBe(400);
    });

    it('should reject password exceeding max length', async () => {
      const longPassword = 'A'.repeat(129);
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: longPassword,
          name: 'Test',
          role: 'ANALYST',
          tenantSlug: 'acme',
        });

      expect(response.status).toBe(400);
    });

    it('should reject password shorter than minimum length', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'short',
          name: 'Test',
          role: 'ANALYST',
          tenantSlug: 'acme',
        });

      expect(response.status).toBe(400);
    });

    it('should strip unknown properties from request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
          malicious: 'injected-field',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('CORS', () => {
    it('should return CORS headers for allowed origin', async () => {
      const response = await request(app.getHttpServer())
        .options('/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000',
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});
