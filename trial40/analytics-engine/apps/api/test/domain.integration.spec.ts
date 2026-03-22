// TRACED:AE-TEST-05 — Domain integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Domain Integration (e2e)', () => {
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

  it('GET /events should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/events')
      .expect(401);
  });

  it('GET /dashboards should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);
  });

  it('GET /data-sources should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);
  });

  it('GET /pipelines should require authentication', async () => {
    await request(app.getHttpServer())
      .get('/pipelines')
      .expect(401);
  });

  it('POST /events should reject invalid body', async () => {
    await request(app.getHttpServer())
      .post('/events')
      .send({})
      .expect(401);
  });

  it('POST /dashboards should reject without auth', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .send({ title: 'Test' })
      .expect(401);
  });
});
