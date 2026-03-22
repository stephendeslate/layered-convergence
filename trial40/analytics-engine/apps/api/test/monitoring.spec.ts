// TRACED:AE-MON-12 — Monitoring tests for health, correlation IDs, structured logs, error sanitization
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createCorrelationId, formatLogEntry } from '@analytics-engine/shared';

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

  describe('Health endpoints', () => {
    it('GET /health should return status ok with required fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.version).toBeDefined();
    });

    it('GET /health/ready should check database connectivity', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready');

      expect(response.body.status).toBeDefined();
      expect(response.body.database).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('GET /health should be accessible without auth', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
    });

    it('GET /metrics should return operational metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics');

      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Correlation ID propagation', () => {
    it('should generate X-Correlation-ID when not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should preserve client-provided X-Correlation-ID', async () => {
      const clientId = createCorrelationId();
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(clientId);
    });
  });

  describe('Structured log format', () => {
    it('formatLogEntry should produce valid JSON', () => {
      const entry = formatLogEntry('info', 'test message', { key: 'value' });
      const parsed = JSON.parse(entry);

      expect(parsed.timestamp).toBeDefined();
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
      expect(parsed.context).toEqual({ key: 'value' });
    });

    it('formatLogEntry should work without context', () => {
      const entry = formatLogEntry('error', 'error occurred');
      const parsed = JSON.parse(entry);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('error occurred');
      expect(parsed.context).toBeUndefined();
    });
  });

  describe('Error sanitization', () => {
    it('should not expose stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body.stack).toBeUndefined();
    });

    it('should include correlationId in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);

      expect(response.body.correlationId).toBeDefined();
    });
  });
});
