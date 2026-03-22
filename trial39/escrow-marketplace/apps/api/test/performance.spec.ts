// TRACED: EM-TEST-007 — Performance tests for interceptor and pagination
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  normalizePageParams,
  withTimeout,
  TimeoutError,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@escrow-marketplace/shared';

describe('Performance Tests', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const prismaService = {
      listing: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      transaction: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
    };

    process.env.JWT_SECRET = 'test-perf-secret-key';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const jwtService = app.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({
      sub: 'user-001',
      email: 'perf@test.com',
      role: 'BUYER',
      tenantId: 'tenant-001',
    });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('ResponseTimeInterceptor', () => {
    it('should add X-Response-Time header to responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+(\.\d+)?ms/);
    });

    it('should add X-Response-Time to authenticated endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?tenantId=tenant-001')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('normalizePageParams', () => {
    it('should clamp pageSize to MAX_PAGE_SIZE when exceeded', () => {
      const result = normalizePageParams(1, 500);
      expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should default pageSize to 1 for zero or negative values', () => {
      const result = normalizePageParams(1, 0);
      expect(result.pageSize).toBe(1);

      const result2 = normalizePageParams(1, -5);
      expect(result2.pageSize).toBe(1);
    });

    it('should normalize page to minimum of 1', () => {
      const result = normalizePageParams(0, 20);
      expect(result.page).toBe(1);

      const result2 = normalizePageParams(-1, 20);
      expect(result2.page).toBe(1);
    });

    it('should pass through valid values unchanged', () => {
      const result = normalizePageParams(3, 50);
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(50);
    });

    it('should handle NaN gracefully', () => {
      const result = normalizePageParams(NaN, NaN);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
    });
  });

  describe('withTimeout', () => {
    it('should resolve when function completes within timeout', async () => {
      const result = await withTimeout(
        () => Promise.resolve('done'),
        1000,
      );
      expect(result).toBe('done');
    });

    it('should throw TimeoutError when function exceeds timeout', async () => {
      await expect(
        withTimeout(
          () => new Promise((resolve) => setTimeout(resolve, 500)),
          10,
        ),
      ).rejects.toThrow(TimeoutError);
    });

    it('should propagate function errors', async () => {
      await expect(
        withTimeout(
          () => Promise.reject(new Error('test error')),
          1000,
        ),
      ).rejects.toThrow('test error');
    });
  });

  describe('Pagination enforcement on endpoints', () => {
    it('should clamp oversized pageSize on listings endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?tenantId=tenant-001&pageSize=500')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pageSize).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    });

    it('should clamp oversized pageSize on transactions endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?tenantId=tenant-001&pageSize=500')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pageSize).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    });
  });
});
