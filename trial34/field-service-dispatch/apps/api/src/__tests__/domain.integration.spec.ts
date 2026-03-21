import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

// TRACED: FD-TA-INT-002 — Domain integration tests with supertest
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

  it('GET /workorders should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/workorders');
    expect(res.status).toBe(401);
  });

  it('POST /workorders should require authentication', async () => {
    const res = await request(app.getHttpServer())
      .post('/workorders')
      .send({ title: 'Test Work Order' });
    expect(res.status).toBe(401);
  });

  it('PATCH /workorders/:id/status should require authentication', async () => {
    const res = await request(app.getHttpServer())
      .patch('/workorders/123/status')
      .send({ status: 'ASSIGNED' });
    expect(res.status).toBe(401);
  });

  it('GET /technicians should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/technicians');
    expect(res.status).toBe(401);
  });

  it('POST /technicians should require authentication', async () => {
    const res = await request(app.getHttpServer())
      .post('/technicians')
      .send({ name: 'Test Tech', specialization: 'HVAC' });
    expect(res.status).toBe(401);
  });
});
