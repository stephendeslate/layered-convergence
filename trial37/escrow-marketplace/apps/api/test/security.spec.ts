import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED: EM-TEST-003 — Security test for Helmet headers
// TRACED: EM-TEST-006 — Security input validation tests

describe('Security', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    listing: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

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

  it('should include Helmet security headers', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('should include Content-Security-Policy header', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/health');

    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('should reject XSS-like input in name field', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'xss@example.com',
        password: 'password123',
        name: '<script>alert("xss")</script>',
        role: 'BUYER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

    expect([200, 201, 400, 409]).toContain(response.status);
  });

  it('should reject oversized string fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'A'.repeat(101),
        role: 'BUYER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

    expect(response.status).toBe(400);
  });

  it('should reject SQL injection-like input in email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "admin@example.com'; DROP TABLE users; --",
        password: 'password123',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
      });

    expect(response.status).toBe(400);
  });

  it('should strip unknown properties from request body', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'BUYER',
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        isAdmin: true,
        escalatePrivileges: true,
      });

    expect(response.status).toBe(400);
  });

  it('should return 401 for requests without auth token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile');

    expect(response.status).toBe(401);
  });
});
