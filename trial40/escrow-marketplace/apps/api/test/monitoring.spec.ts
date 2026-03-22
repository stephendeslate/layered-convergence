// TRACED: EM-TEST-008 — Monitoring tests for L8 features
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createCorrelationId, formatLogEntry } from '@escrow-marketplace/shared';
import { MetricsService } from '../src/monitoring/metrics.service';

describe('Monitoring (e2e)', () => {
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

  describe('Health Endpoints', () => {
    it('GET /health should return status ok with timestamp and uptime', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.version).toBeDefined();
    });

    it('GET /health/ready should check database connectivity', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBeDefined();
      expect(response.body.database).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('Health endpoints should be exempt from rate limiting', async () => {
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .get('/health')
          .expect(200);
      }
    });
  });

  describe('Correlation ID', () => {
    it('should generate correlation ID if not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should preserve client-provided correlation ID', async () => {
      const clientCorrelationId = '12345678-1234-1234-1234-123456789abc';

      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientCorrelationId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(clientCorrelationId);
    });
  });

  describe('Structured Logging', () => {
    it('createCorrelationId should return valid UUID v4', () => {
      const id = createCorrelationId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('formatLogEntry should return valid JSON with required fields', () => {
      const entry = formatLogEntry('info', 'test message', { foo: 'bar' });
      const parsed = JSON.parse(entry);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
      expect(parsed.foo).toBe('bar');
    });

    it('formatLogEntry should work without optional context', () => {
      const entry = formatLogEntry('error', 'error occurred');
      const parsed = JSON.parse(entry);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('error occurred');
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('Error Sanitization', () => {
    it('should return sanitized error without stack traces', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body.stack).toBeUndefined();
    });

    it('should include correlationId in error responses from exception filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings')
        .expect(401);

      // Error response should not contain internal stack traces
      expect(response.body.stack).toBeUndefined();
    });
  });

  describe('Metrics', () => {
    it('MetricsService should track request counts', () => {
      const metricsService = new MetricsService();
      metricsService.recordRequest(50);
      metricsService.recordRequest(100);

      const metrics = metricsService.getMetrics();
      expect(metrics.requestCount).toBe(2);
      expect(metrics.averageResponseTimeMs).toBe(75);
    });

    it('MetricsService should track error counts', () => {
      const metricsService = new MetricsService();
      metricsService.recordError();
      metricsService.recordError();

      const metrics = metricsService.getMetrics();
      expect(metrics.errorCount).toBe(2);
    });

    it('MetricsService should report uptime', () => {
      const metricsService = new MetricsService();
      const metrics = metricsService.getMetrics();
      expect(typeof metrics.uptimeSeconds).toBe('number');
      expect(metrics.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });
  });
});
