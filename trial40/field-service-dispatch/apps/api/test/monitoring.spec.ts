// TRACED: FD-MON-003 — Monitoring tests: correlation ID, log formatting, metrics, health
// TRACED: FD-MON-004 — Structured log entry format validation
// TRACED: FD-MON-011 — Error boundary and exception filter coverage
import {
  createCorrelationId,
  formatLogEntry,
} from '@field-service-dispatch/shared';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MetricsService } from '../src/monitoring/metrics.service';

describe('Monitoring', () => {
  describe('createCorrelationId', () => {
    it('should generate a UUID v4 format string', () => {
      const id = createCorrelationId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => createCorrelationId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('formatLogEntry', () => {
    it('should return valid JSON string', () => {
      const entry = formatLogEntry('info', 'test message');
      const parsed = JSON.parse(entry);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should include context fields', () => {
      const entry = formatLogEntry('error', 'failure', {
        correlationId: 'abc-123',
        statusCode: 500,
      });
      const parsed = JSON.parse(entry);
      expect(parsed.correlationId).toBe('abc-123');
      expect(parsed.statusCode).toBe(500);
    });

    it('should produce ISO timestamp', () => {
      const entry = formatLogEntry('warn', 'test');
      const parsed = JSON.parse(entry);
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });

    it('should handle empty context', () => {
      const entry = formatLogEntry('debug', 'no context');
      const parsed = JSON.parse(entry);
      expect(parsed.level).toBe('debug');
      expect(parsed.correlationId).toBeUndefined();
    });
  });

  describe('MetricsService', () => {
    let metricsService: MetricsService;

    beforeEach(() => {
      metricsService = new MetricsService();
    });

    it('should start with zero counts', () => {
      const metrics = metricsService.getMetrics();
      expect(metrics.requestCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
    });

    it('should track request count', () => {
      metricsService.recordRequest(10);
      metricsService.recordRequest(20);
      metricsService.recordRequest(30);

      const metrics = metricsService.getMetrics();
      expect(metrics.requestCount).toBe(3);
    });

    it('should calculate average response time', () => {
      metricsService.recordRequest(10);
      metricsService.recordRequest(30);

      const metrics = metricsService.getMetrics();
      expect(metrics.averageResponseTime).toBe(20);
    });

    it('should track error count', () => {
      metricsService.recordError();
      metricsService.recordError();

      const metrics = metricsService.getMetrics();
      expect(metrics.errorCount).toBe(2);
    });

    it('should report uptime in seconds', () => {
      const metrics = metricsService.getMetrics();
      expect(metrics.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.uptime).toBe('number');
    });
  });

  describe('Health Endpoints (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    it('GET /health should return status ok with timestamp, uptime, and version', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(typeof response.body.uptime).toBe('number');
    });

    it('GET /health/ready should return 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return X-Correlation-ID header on responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-correlation-id']).toBeDefined();
    });

    it('should preserve client-provided X-Correlation-ID header', async () => {
      const clientCorrelationId = 'test-correlation-id-12345';
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientCorrelationId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(clientCorrelationId);
    });

    it('should not contain stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route-for-testing')
        .expect(404);

      expect(response.body).not.toHaveProperty('stack');
      expect(JSON.stringify(response.body)).not.toMatch(/at\s+\S+\s+\(/);
    });
  });
});
