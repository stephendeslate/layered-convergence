import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';

describe('Auth - x-company-id required (integration)', () => {
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

  it('should return 400 when x-company-id is missing for technicians', async () => {
    const res = await request(app.getHttpServer())
      .get('/technicians')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should return 400 when x-company-id is missing for customers', async () => {
    const res = await request(app.getHttpServer())
      .get('/customers')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should return 400 when x-company-id is missing for work-orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should return 400 when x-company-id is missing for invoices', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices')
      .expect(400);

    expect(res.body.message).toContain('x-company-id');
  });

  it('should NOT require x-company-id for companies endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get('/companies')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
