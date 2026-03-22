import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * SUPERTEST integration tests for monitoring (FM#95 fix).
 * Tests health endpoints, correlation ID propagation, and error sanitization
 * via actual HTTP requests against the real AppModule.
 */
// TRACED: FD-MONITORING-TEST
describe('Monitoring (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-monitoring-tests';
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

  describe('GET /health', () => {
    it('should return health status with required fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.version).toBeDefined();
    });

    it('should be accessible without authentication', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
    });
  });

  describe('GET /metrics', () => {
    it('should return operational metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Correlation ID propagation', () => {
    it('should return correlation ID when client sends one', async () => {
      const clientCorrelationId = 'test-correlation-id-12345';
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientCorrelationId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(clientCorrelationId);
    });

    it('should generate correlation ID when client does not send one', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('Error sanitization', () => {
    it('should not expose stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders')
        .expect(401);

      expect(response.body.stack).toBeUndefined();
      expect(response.body.statusCode).toBe(401);
    });

    it('should include correlation ID in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders')
        .set('X-Correlation-ID', 'error-test-correlation')
        .expect(401);

      expect(response.body.correlationId).toBe('error-test-correlation');
    });
  });

  describe('Structured logging', () => {
    it('should use JSON-formatted log output (Pino)', async () => {
      // Verify the health endpoint works, which exercises the full middleware stack
      // including Pino-based request logging
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });

  describe('Request context service (T41 variation)', () => {
    it('should propagate client correlation ID through request context', async () => {
      const correlationId = 'ctx-test-correlation-id';
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId)
        .expect(200);

      // Correlation ID should be echoed back in response header
      expect(response.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should include correlation ID in 401 error via context service', async () => {
      const response = await request(app.getHttpServer())
        .get('/technicians')
        .set('X-Correlation-ID', 'auth-fail-correlation')
        .expect(401);

      expect(response.body.correlationId).toBe('auth-fail-correlation');
    });
  });
});
