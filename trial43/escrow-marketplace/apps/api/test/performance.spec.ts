// TRACED: EM-TPERF-001
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Performance Integration (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        listing: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        escrow: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        transaction: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        dispute: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        user: { findFirst: jest.fn().mockResolvedValue(null) },
      })
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response time header', () => {
    it('should include X-Response-Time header on health', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should include X-Response-Time on metrics', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Health endpoint performance', () => {
    it('should respond to /health under 200ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer()).get('/health');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Pagination clamping', () => {
    it('should clamp pageSize to MAX_PAGE_SIZE (not reject)', async () => {
      const { clampPageSize } = require('@escrow-marketplace/shared');
      expect(clampPageSize(500)).toBe(100);
      expect(clampPageSize(50)).toBe(50);
      expect(clampPageSize(undefined)).toBe(20);
      expect(clampPageSize(0)).toBe(20);
    });
  });

  describe('connection_limit', () => {
    it('should have connection_limit in DATABASE_URL pattern', () => {
      const fs = require('fs');
      const path = require('path');
      const envExample = fs.readFileSync(
        path.join(__dirname, '..', '..', '..', '.env.example'),
        'utf-8',
      );
      expect(envExample).toContain('connection_limit');
    });
  });
});
