// TRACED: FD-TEST-007 — Performance tests for response time, pagination, and withTimeout
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ResponseTimeInterceptor } from '../src/common/interceptors/response-time.interceptor';
import {
  withTimeout,
  TimeoutError,
  normalizePageParams,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@field-service-dispatch/shared';

describe('Performance', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalInterceptors(new ResponseTimeInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response time', () => {
    it('should respond to unauthenticated requests within 500ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer()).get('/auth/me');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should respond to validation errors within 500ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad', password: 'x', role: 'INVALID', tenantId: 'y' });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('Pagination limits', () => {
    it('should clamp pageSize exceeding MAX_PAGE_SIZE', () => {
      const result = normalizePageParams(1, 500);
      expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should accept pageSize within MAX_PAGE_SIZE', () => {
      const result = normalizePageParams(1, 50);
      expect(result.pageSize).toBe(50);
    });

    it('should normalize page to minimum 1', () => {
      const result = normalizePageParams(0, 20);
      expect(result.page).toBe(1);
    });

    it('should normalize negative page to 1', () => {
      const result = normalizePageParams(-10, 20);
      expect(result.page).toBe(1);
    });

    it('should handle pageSize at exactly MAX_PAGE_SIZE', () => {
      const result = normalizePageParams(1, 100);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('withTimeout', () => {
    it('should return result when function completes within timeout', async () => {
      const result = await withTimeout(async () => 42, 1000);
      expect(result).toBe(42);
    });

    it('should throw TimeoutError when function exceeds timeout', async () => {
      await expect(
        withTimeout(
          () => new Promise((resolve) => setTimeout(resolve, 500)),
          10,
        ),
      ).rejects.toThrow(TimeoutError);
    });

    it('should propagate errors from the wrapped function', async () => {
      await expect(
        withTimeout(async () => {
          throw new Error('inner error');
        }, 1000),
      ).rejects.toThrow('inner error');
    });

    it('should resolve async values correctly', async () => {
      const result = await withTimeout(async () => {
        return 'hello';
      }, 1000);

      expect(result).toBe('hello');
    });

    it('TimeoutError should have correct name and message', () => {
      const err = new TimeoutError(5000);
      expect(err.name).toBe('TimeoutError');
      expect(err.message).toContain('5000');
    });
  });

  describe('API response caching', () => {
    it('should reject unauthenticated work order list requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders');

      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated technician list requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/technicians');

      expect(response.status).toBe(401);
    });
  });
});
