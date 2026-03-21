import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

// TRACED: EM-TA-INT-002 — Domain integration tests with supertest
describe('Domain Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('GET /listings should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/listings');
    expect(res.status).toBe(401);
  });

  it('POST /listings should require authentication', async () => {
    const res = await request(app.getHttpServer()).post('/listings').send({ title: 'Test', price: 10 });
    expect(res.status).toBe(401);
  });

  it('GET /transactions should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/transactions');
    expect(res.status).toBe(401);
  });

  it('POST /transactions should require authentication', async () => {
    const res = await request(app.getHttpServer()).post('/transactions').send({ listingId: '1', amount: 10 });
    expect(res.status).toBe(401);
  });

  it('PATCH /transactions/:id/status should require authentication', async () => {
    const res = await request(app.getHttpServer()).patch('/transactions/123/status').send({ status: 'FUNDED' });
    expect(res.status).toBe(401);
  });
});
