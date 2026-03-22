// TRACED:AE-TEST-07 — Performance tests for response time and pagination
// TRACED:AE-PERF-12 — Validates MAX_PAGE_SIZE clamping and response time header

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MAX_PAGE_SIZE, normalizePageParams } from '@analytics-engine/shared';

describe('Performance (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'performance-test-secret-key';
    process.env.CORS_ORIGIN = 'http://localhost:3001';

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
    await app?.close();
  });

  describe('Response Time', () => {
    it('should set X-Response-Time header on health endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/health')
        .expect(200);

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should respond to health check within 500ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/auth/health')
        .expect(200);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('Pagination Clamping', () => {
    it('should clamp pageSize to MAX_PAGE_SIZE', () => {
      const params = normalizePageParams(1, 500);
      expect(params.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should enforce minimum page of 1', () => {
      const params = normalizePageParams(-5, 20);
      expect(params.page).toBe(1);
    });

    it('should enforce minimum pageSize of 1', () => {
      const params = normalizePageParams(1, 0);
      expect(params.pageSize).toBeGreaterThanOrEqual(1);
    });

    it('should handle NaN inputs gracefully', () => {
      const params = normalizePageParams(NaN, NaN);
      expect(params.page).toBe(1);
      expect(params.pageSize).toBeGreaterThanOrEqual(1);
    });

    it('should floor fractional page numbers', () => {
      const params = normalizePageParams(2.7, 15.3);
      expect(params.page).toBe(2);
      expect(params.pageSize).toBe(15);
    });
  });

  describe('MAX_PAGE_SIZE constant', () => {
    it('should be set to 100', () => {
      expect(MAX_PAGE_SIZE).toBe(100);
    });
  });
});
