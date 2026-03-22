// TRACED:EM-PERF-04 performance tests
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { normalizePageParams, MAX_PAGE_SIZE } from '@em/shared';

describe('Performance', () => {
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

  it('should set X-Response-Time header', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.headers['x-response-time']).toBeDefined();
    expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
  });

  it('should clamp page size to MAX_PAGE_SIZE', () => {
    const result = normalizePageParams(1, 999);
    expect(result.pageSize).toBe(MAX_PAGE_SIZE);
  });

  it('should normalize negative page numbers', () => {
    const result = normalizePageParams(-5, 10);
    expect(result.page).toBe(1);
  });

  it('should use default page size when not provided', () => {
    const result = normalizePageParams(1);
    expect(result.pageSize).toBe(20);
  });
});
