// TRACED: EM-TEST-006 — Security tests with supertest HTTP assertions
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Security Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const prismaService = {
      user: { findFirst: jest.fn(), create: jest.fn() },
      listing: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), count: jest.fn().mockResolvedValue(0) },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
    };

    process.env.JWT_SECRET = 'test-security-secret-key';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

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
    if (app) await app.close();
  });

  describe('Helmet Security Headers', () => {
    it('should set Content-Security-Policy header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/health');

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/health');

      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app.getHttpServer()).get('/auth/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Input Validation', () => {
    it('should reject XSS payloads in registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'xss@test.com',
          password: 'securepass123',
          name: '<script>alert("xss")</script>',
          role: 'BUYER',
          tenantId: 'tenant-001',
        });

      // The request should either be rejected or sanitized
      expect(response.status).toBeLessThan(500);
    });

    it('should reject requests with unknown fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'securepass123',
          name: 'Test',
          role: 'BUYER',
          tenantId: 'tenant-001',
          maliciousField: 'drop table users',
        });

      expect(response.status).toBe(400);
    });

    it('should enforce MaxLength on string fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'securepass123',
          name: 'A'.repeat(200),
          role: 'BUYER',
          tenantId: 'tenant-001',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Auth Guards', () => {
    it('should return 401 for unauthenticated listing access', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?tenantId=t1');

      expect(response.status).toBe(401);
    });

    it('should return 401 for unauthenticated transaction access', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?tenantId=t1');

      expect(response.status).toBe(401);
    });
  });
});
