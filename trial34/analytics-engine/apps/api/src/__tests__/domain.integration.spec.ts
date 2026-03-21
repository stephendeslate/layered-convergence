import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

// TRACED: AE-TA-INT-002 — Domain integration tests with supertest
describe('Domain Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /dashboards should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/dashboards');
    expect(res.status).toBe(401);
  });

  it('POST /dashboards should require authentication', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .send({ name: 'Test Dashboard' });
    expect(res.status).toBe(401);
  });

  it('GET /pipelines should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/pipelines');
    expect(res.status).toBe(401);
  });

  it('POST /pipelines should require authentication', async () => {
    const res = await request(app.getHttpServer())
      .post('/pipelines')
      .send({ name: 'Test Pipeline', config: {} });
    expect(res.status).toBe(401);
  });

  it('PATCH /pipelines/:id/status should require authentication', async () => {
    const res = await request(app.getHttpServer())
      .patch('/pipelines/123/status')
      .send({ status: 'RUNNING' });
    expect(res.status).toBe(401);
  });
});
