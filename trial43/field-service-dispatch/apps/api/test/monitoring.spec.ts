// TRACED: FD-MONITORING-SPEC
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
    it('should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status with database check', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Correlation ID propagation', () => {
    it('should return X-Correlation-ID header when not provided', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should preserve X-Correlation-ID when client provides it', async () => {
      const clientCorrelationId = 'test-correlation-id-12345';

      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientCorrelationId);

      expect(response.headers['x-correlation-id']).toBe(clientCorrelationId);
    });
  });

  describe('X-Response-Time header', () => {
    it('should include X-Response-Time header on responses', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });
  });

  describe('Error sanitization', () => {
    it('should not expose stack traces in error responses', async () => {
      const response = await request(app.getHttpServer()).get(
        '/work-orders/nonexistent-id',
      );

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /metrics', () => {
    it('should return operational metrics', async () => {
      await request(app.getHttpServer()).get('/health');
      await request(app.getHttpServer()).get('/health');

      const response = await request(app.getHttpServer()).get('/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requestCount');
      expect(response.body).toHaveProperty('errorCount');
      expect(response.body).toHaveProperty('averageResponseTime');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.requestCount).toBeGreaterThan(0);
    });
  });
});
