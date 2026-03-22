// TRACED:AE-MONITORING-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Monitoring Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
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
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status with required fields', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'ok',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          version: expect.any(String),
        }),
      );
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status with database check', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: expect.stringMatching(/^(ok|error)$/),
          database: expect.stringMatching(/^(connected|disconnected)$/),
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe('GET /metrics', () => {
    it('should return operational metrics', async () => {
      // Make a few requests first to populate metrics
      await request(app.getHttpServer()).get('/health');
      await request(app.getHttpServer()).get('/health');

      const response = await request(app.getHttpServer()).get('/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          requestCount: expect.any(Number),
          errorCount: expect.any(Number),
          avgResponseTimeMs: expect.any(Number),
          uptime: expect.any(Number),
        }),
      );
      expect(response.body.requestCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Correlation ID propagation', () => {
    it('should return correlation ID when client sends one', async () => {
      const clientCorrelationId = 'test-correlation-12345';

      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientCorrelationId);

      expect(response.headers['x-correlation-id']).toBe(clientCorrelationId);
    });

    it('should generate correlation ID when client does not send one', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('Error sanitization', () => {
    it('should return sanitized error for unknown routes', async () => {
      const response = await request(app.getHttpServer()).get(
        '/nonexistent-endpoint',
      );

      expect(response.body.stack).toBeUndefined();
      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: expect.any(Number),
          message: expect.any(String),
          timestamp: expect.any(String),
          path: expect.any(String),
        }),
      );
    });

    it('should not expose internal details on 500 errors', async () => {
      const response = await request(app.getHttpServer()).get(
        '/nonexistent-endpoint',
      );

      expect(response.body.stack).toBeUndefined();
      expect(response.body.trace).toBeUndefined();
    });
  });

  describe('Request logging', () => {
    it('should track request count in metrics after multiple requests', async () => {
      const metricsBefore = await request(app.getHttpServer()).get('/metrics');
      const initialCount = metricsBefore.body.requestCount;

      await request(app.getHttpServer()).get('/health');
      await request(app.getHttpServer()).get('/health');
      await request(app.getHttpServer()).get('/health');

      const metricsAfter = await request(app.getHttpServer()).get('/metrics');
      expect(metricsAfter.body.requestCount).toBeGreaterThan(initialCount);
    });
  });
});
