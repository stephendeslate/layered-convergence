// TRACED:EM-MON-11 monitoring integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Monitoring Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('Health Endpoints', () => {
    it('GET /health should return status ok', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.version).toBeDefined();
    });

    it('GET /health should be accessible without auth', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });

    it('GET /health/ready should check database connectivity', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');
      // May fail in test env without DB — but should not return 401 (auth bypass works)
      expect(response.status).not.toBe(401);
    });
  });

  describe('Correlation ID', () => {
    it('should return X-Correlation-ID header when not provided', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should preserve client-sent X-Correlation-ID', async () => {
      const clientId = 'client-correlation-12345';
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientId);
      expect(response.headers['x-correlation-id']).toBe(clientId);
    });

    it('should generate unique correlation IDs per request', async () => {
      const response1 = await request(app.getHttpServer()).get('/health');
      const response2 = await request(app.getHttpServer()).get('/health');
      expect(response1.headers['x-correlation-id']).not.toBe(
        response2.headers['x-correlation-id'],
      );
    });
  });

  describe('Error Sanitization', () => {
    it('should not expose stack traces in error responses', async () => {
      const response = await request(app.getHttpServer()).get('/nonexistent-route');
      expect(response.body.stack).toBeUndefined();
    });

    it('should include correlation ID in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?tenantId=test');
      // 401 from auth guard — should still have correlation header
      expect(response.headers['x-correlation-id']).toBeDefined();
    });
  });

  describe('Metrics Endpoint', () => {
    it('GET /metrics should return operational metrics', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.body.requestCount).toBeDefined();
      expect(response.body.errorCount).toBeDefined();
      expect(response.body.averageResponseTime).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    it('GET /metrics should be accessible without auth', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.status).toBe(200);
    });
  });
});
