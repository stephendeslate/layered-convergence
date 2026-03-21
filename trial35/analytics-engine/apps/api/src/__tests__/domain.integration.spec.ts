// TRACED: AE-TEST-005 — Domain integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Domain Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /dashboards', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /dashboards', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .send({ name: 'Test Dashboard' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /pipelines', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/pipelines');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /pipelines', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/pipelines')
        .send({ name: 'ETL Pipeline', source: 'postgres' });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /pipelines/:id/status', () => {
    it('should reject unauthenticated status updates', async () => {
      const response = await request(app.getHttpServer())
        .patch('/pipelines/test-id/status')
        .send({ status: 'ACTIVE' });

      expect(response.status).toBe(401);
    });
  });
});
