// TRACED:AE-TEST-05 — Domain integration tests with supertest

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Domain Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'domain-integration-test-secret';
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

  describe('GET /dashboards', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .expect(401);
    });

    it('should reject requests without valid JWT', async () => {
      await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /pipelines', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/pipelines')
        .expect(401);
    });

    it('should reject requests without valid JWT', async () => {
      await request(app.getHttpServer())
        .get('/pipelines')
        .set('Authorization', 'Bearer bad-token')
        .expect(401);
    });
  });

  describe('POST /dashboards', () => {
    it('should reject unauthenticated create', async () => {
      await request(app.getHttpServer())
        .post('/dashboards')
        .send({
          title: 'Unauthorized Dashboard',
          tenantId: 'tenant-1',
          createdById: 'user-1',
        })
        .expect(401);
    });
  });

  describe('POST /pipelines', () => {
    it('should reject unauthenticated create', async () => {
      await request(app.getHttpServer())
        .post('/pipelines')
        .send({
          name: 'Unauthorized Pipeline',
          tenantId: 'tenant-1',
        })
        .expect(401);
    });
  });

  describe('DELETE /dashboards/:id', () => {
    it('should reject unauthenticated delete', async () => {
      await request(app.getHttpServer())
        .delete('/dashboards/some-id')
        .expect(401);
    });
  });

  describe('DELETE /pipelines/:id', () => {
    it('should reject unauthenticated delete', async () => {
      await request(app.getHttpServer())
        .delete('/pipelines/some-id')
        .expect(401);
    });
  });
});
