// TRACED:AE-PERF-08 — Performance tests for response time and pagination
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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

  it('should set X-Response-Time header', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.headers['x-response-time']).toBeDefined();
    expect(response.headers['x-response-time']).toMatch(/^\d+\.\d+ms$/);
  });

  it('should respond to health check within 500ms', async () => {
    const start = Date.now();
    await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(500);
  });

  it('health check should return uptime and version', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.uptime).toBeDefined();
    expect(response.body.version).toBeDefined();
    expect(response.body.timestamp).toBeDefined();
  });
});
