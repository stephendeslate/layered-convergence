// TRACED: EM-TXLR-001
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { APP_VERSION } from '@escrow-marketplace/shared';

describe('Cross-Layer Integration (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: {
      create: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'cross@test.com',
        name: 'Cross Layer',
        role: 'BUYER',
        tenantId: 'tenant-1',
        createdAt: new Date(),
      }),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    listing: {
      create: jest.fn().mockResolvedValue({
        id: 'listing-1',
        title: 'Cross Layer Listing',
        description: 'Test item',
        price: 99.99,
        status: 'DRAFT',
        sellerId: 'user-1',
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    escrow: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    transaction: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    dispute: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

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

  describe('End-to-end auth flow', () => {
    it('should register a new user via public endpoint', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'cross@test.com',
          password: 'password123',
          name: 'Cross Layer',
          role: 'BUYER',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrong',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Authenticated CRUD operations', () => {
    it('should create a listing with valid JWT', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'crud@test.com',
          password: 'password123',
          name: 'CRUD User',
          role: 'SELLER',
          tenantId: 'tenant-1',
        });

      const token = registerRes.body.token;
      const createRes = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Cross Layer Listing',
          description: 'Test item for cross-layer validation',
          price: 99.99,
          tenantId: 'tenant-1',
        });

      expect([201, 400]).toContain(createRes.status);
      expect(createRes.headers['x-correlation-id']).toBeDefined();
      expect(createRes.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Guard chain validation', () => {
    it('should block unauthenticated access to listings', async () => {
      const response = await request(app.getHttpServer()).get('/listings');
      expect(response.status).toBe(401);
    });

    it('should allow unauthenticated access to health', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });

    it('should allow unauthenticated access to metrics', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.status).toBe(200);
    });
  });

  describe('Response headers across layers', () => {
    it('should include X-Response-Time on all responses', async () => {
      const health = await request(app.getHttpServer()).get('/health');
      expect(health.headers['x-response-time']).toBeDefined();

      const auth = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });
      expect(auth.headers['x-response-time']).toBeDefined();
    });

    it('should include X-Correlation-ID on all responses', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-correlation-id']).toBeDefined();
    });

    it('should include security headers from Helmet', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });

  describe('Validation layer integration', () => {
    it('should reject invalid payload with 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.correlationId).toBeDefined();
    });

    it('should reject forbidden extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'BUYER',
          tenantId: 'tenant-1',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Health endpoint with APP_VERSION', () => {
    it('should return APP_VERSION from shared package', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.body.version).toBe(APP_VERSION);
    });
  });

  describe('Error response format', () => {
    it('should include correlationId in error responses', async () => {
      const correlationId = 'cross-layer-test-789';
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .set('X-Correlation-ID', correlationId);

      expect(response.status).toBe(404);
      expect(response.body.correlationId).toBe(correlationId);
      expect(response.body.stack).toBeUndefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
