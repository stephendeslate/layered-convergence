// TRACED: EM-TMON-001
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Monitoring Integration (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        listing: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        escrow: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        transaction: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        dispute: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        user: { findFirst: jest.fn().mockResolvedValue(null) },
      })
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

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.version).toBe('1.0.0');
    });

    it('should not require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness with database status', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
    });
  });

  describe('GET /metrics', () => {
    it('should return operational metrics', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Correlation ID', () => {
    it('should return X-Correlation-ID in response', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-correlation-id']).toBeDefined();
    });

    it('should preserve client-provided correlation ID', async () => {
      const correlationId = 'test-correlation-123';
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId);
      expect(response.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should generate a new correlation ID if not provided', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      const id = response.headers['x-correlation-id'];
      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('Error sanitization', () => {
    it('should return sanitized error without stack trace', async () => {
      const response = await request(app.getHttpServer()).get('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.stack).toBeUndefined();
      expect(response.body.correlationId).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should include correlationId in error responses', async () => {
      const correlationId = 'error-test-456';
      const response = await request(app.getHttpServer())
        .get('/nonexistent')
        .set('X-Correlation-ID', correlationId);
      expect(response.body.correlationId).toBe(correlationId);
    });
  });

  describe('X-Response-Time', () => {
    it('should include X-Response-Time header', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });
  });
});
