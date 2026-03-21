// TRACED: EM-TEST-005 — Domain integration tests with supertest
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

  describe('GET /listings', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer()).get('/listings');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /listings', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/listings')
        .send({ title: 'Test', description: 'Desc', price: '99.99' });
      expect(response.status).toBe(401);
    });
  });

  describe('GET /transactions', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer()).get('/transactions');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /transactions', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({ listingId: 'lst-1', amount: '100.00' });
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /transactions/:id/status', () => {
    it('should reject unauthenticated status updates', async () => {
      const response = await request(app.getHttpServer())
        .patch('/transactions/test-id/status')
        .send({ status: 'ESCROWED' });
      expect(response.status).toBe(401);
    });
  });
});
