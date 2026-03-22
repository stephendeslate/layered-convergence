// TRACED: FD-TEST-005 — Domain integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Domain Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /work-orders', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /work-orders', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .send({ title: 'Fix HVAC' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /technicians', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/technicians');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /technicians', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/technicians')
        .send({ name: 'John Doe' });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /work-orders/:id/status', () => {
    it('should reject unauthenticated status updates', async () => {
      const response = await request(app.getHttpServer())
        .patch('/work-orders/test-id/status')
        .send({ status: 'ASSIGNED' });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /technicians/:id', () => {
    it('should reject unauthenticated technician updates', async () => {
      const response = await request(app.getHttpServer())
        .patch('/technicians/test-id')
        .send({ name: 'Updated' });

      expect(response.status).toBe(401);
    });
  });
});
