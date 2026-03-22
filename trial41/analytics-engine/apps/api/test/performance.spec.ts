// TRACED:AE-PERFORMANCE-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { normalizePageParams, MAX_PAGE_SIZE } from '@analytics-engine/shared';

describe('Performance (e2e)', () => {
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

  describe('Response time header', () => {
    it('should include X-Response-Time header on health endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });

    it('should include X-Response-Time header on metrics endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Pagination clamping', () => {
    it('should clamp page size to MAX_PAGE_SIZE', () => {
      const result = normalizePageParams(1, 500);
      expect(result.take).toBe(MAX_PAGE_SIZE);
    });

    it('should default page size when not provided', () => {
      const result = normalizePageParams();
      expect(result.take).toBe(20);
      expect(result.skip).toBe(0);
    });

    it('should handle negative page numbers', () => {
      const result = normalizePageParams(-1, 10);
      expect(result.skip).toBe(0);
    });

    it('should handle zero page size', () => {
      const result = normalizePageParams(1, 0);
      expect(result.take).toBe(1);
    });
  });

  describe('Cache-Control headers', () => {
    it('should not have Cache-Control on auth endpoints', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });

      expect(response.headers['cache-control']).toBeUndefined();
    });
  });
});
