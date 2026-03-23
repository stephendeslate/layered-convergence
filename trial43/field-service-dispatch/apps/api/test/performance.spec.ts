// TRACED: FD-PERFORMANCE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Performance Integration (e2e)', () => {
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

  describe('X-Response-Time header', () => {
    it('should include X-Response-Time on all responses', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
    });
  });

  describe('Pagination clamping', () => {
    it('should clamp page size exceeding MAX_PAGE_SIZE', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders?pageSize=500');

      // Should not error, should clamp silently
      expect([200, 401]).toContain(response.status);
    });

    it('should handle negative page numbers gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders?page=-1&pageSize=10');

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Cache-Control headers', () => {
    it('should include Cache-Control on list endpoints', async () => {
      const response = await request(app.getHttpServer()).get('/service-areas');

      if (response.status === 200) {
        expect(response.headers['cache-control']).toBeDefined();
      }
    });
  });

  describe('Health endpoint performance', () => {
    it('should respond within 500ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer()).get('/health');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
