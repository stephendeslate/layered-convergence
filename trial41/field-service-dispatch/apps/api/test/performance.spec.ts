import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { normalizePageParams, MAX_PAGE_SIZE } from '@field-service-dispatch/shared';

// TRACED: FD-PERFORMANCE-TEST
describe('Performance (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-performance-tests';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?connection_limit=5';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Response Time Header', () => {
    it('should include X-Response-Time header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/^\d+ms$/);
    });
  });

  describe('Pagination', () => {
    it('should clamp page size to MAX_PAGE_SIZE', () => {
      const params = normalizePageParams(1, 500);
      expect(params.pageSize).toBe(MAX_PAGE_SIZE);
      expect(params.pageSize).toBe(100);
    });

    it('should default to page 1 and pageSize 20', () => {
      const params = normalizePageParams();
      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(20);
    });

    it('should normalize negative page to 1', () => {
      const params = normalizePageParams(-5, 10);
      expect(params.page).toBe(1);
    });
  });

  describe('Cache-Control', () => {
    it('should not include cache-control on non-list endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['cache-control']).toBeUndefined();
    });
  });
});
