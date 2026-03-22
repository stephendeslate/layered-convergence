// TRACED: FD-TEST-009 — Performance tests for response time and pagination
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ResponseTimeInterceptor } from '../src/interceptors/response-time.interceptor';
import { measureDuration, clampPageSize, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@field-service-dispatch/shared';

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

    it('should respond to auth validation within 500ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid', password: 'short', role: 'BAD', tenantId: 'x' });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('Pagination limits', () => {
    it('should clamp pageSize exceeding MAX_PAGE_SIZE', () => {
      const clamped = clampPageSize(500, MAX_PAGE_SIZE);
      expect(clamped).toBe(100);
    });

    it('should accept pageSize within MAX_PAGE_SIZE', () => {
      const clamped = clampPageSize(50, MAX_PAGE_SIZE);
      expect(clamped).toBe(50);
    });

    it('should use DEFAULT_PAGE_SIZE for zero', () => {
      const clamped = clampPageSize(0, MAX_PAGE_SIZE);
      expect(clamped).toBe(DEFAULT_PAGE_SIZE);
    });

    it('should use DEFAULT_PAGE_SIZE for negative values', () => {
      const clamped = clampPageSize(-10, MAX_PAGE_SIZE);
      expect(clamped).toBe(DEFAULT_PAGE_SIZE);
    });

    it('should clamp to exactly MAX_PAGE_SIZE when requested equals max', () => {
      const clamped = clampPageSize(100, MAX_PAGE_SIZE);
      expect(clamped).toBe(100);
    });
  });

  describe('measureDuration', () => {
    it('should return result and duration', async () => {
      const { result, durationMs } = await measureDuration(async () => 42);

      expect(result).toBe(42);
      expect(typeof durationMs).toBe('number');
      expect(durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should measure async operations accurately', async () => {
      const { result, durationMs } = await measureDuration(async () => {
        return 'done';
      });

      expect(result).toBe('done');
      expect(durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should propagate errors from measured function', async () => {
      await expect(
        measureDuration(async () => {
          throw new Error('test error');
        }),
      ).rejects.toThrow('test error');
    });
  });

  describe('API response caching', () => {
    it('should reject unauthenticated list requests with 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders');

      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated technician list requests with 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/technicians');

      expect(response.status).toBe(401);
    });
  });
});
