// TRACED: FD-TEST-005 — Domain integration tests for work orders and technicians
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

  describe('Work Orders', () => {
    it('should require authentication for listing work orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders');

      expect(response.status).toBe(401);
    });

    it('should require authentication for creating work orders', async () => {
      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .send({ title: 'Test Work Order' });

      expect(response.status).toBe(401);
    });

    it('should require authentication for deleting work orders', async () => {
      const response = await request(app.getHttpServer())
        .delete('/work-orders/wo-123');

      expect(response.status).toBe(401);
    });

    it('should require authentication for updating work order status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/work-orders/wo-123/status')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(401);
    });
  });

  describe('Technicians', () => {
    it('should require authentication for listing technicians', async () => {
      const response = await request(app.getHttpServer())
        .get('/technicians');

      expect(response.status).toBe(401);
    });

    it('should require authentication for creating technicians', async () => {
      const response = await request(app.getHttpServer())
        .post('/technicians')
        .send({ name: 'Test Tech', latitude: '40.7580000', longitude: '-73.9855000' });

      expect(response.status).toBe(401);
    });

    it('should require authentication for deleting technicians', async () => {
      const response = await request(app.getHttpServer())
        .delete('/technicians/tech-123');

      expect(response.status).toBe(401);
    });

    it('should require authentication for updating technicians', async () => {
      const response = await request(app.getHttpServer())
        .patch('/technicians/tech-123')
        .send({ name: 'Updated' });

      expect(response.status).toBe(401);
    });
  });
});
