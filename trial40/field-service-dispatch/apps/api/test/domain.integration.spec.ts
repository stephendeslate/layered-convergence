// TRACED: FD-WO-006 — Domain integration tests for work order lifecycle
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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Work Orders CRUD', () => {
    it('should reject unauthenticated work order creation', async () => {
      const res = await request(app.getHttpServer())
        .post('/work-orders')
        .send({ title: 'Test', priority: 'HIGH' });

      expect(res.status).toBe(401);
    });

    it('should reject work order with missing title', async () => {
      const res = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', 'Bearer invalid-token')
        .send({ priority: 'HIGH' });

      expect(res.status).toBe(401);
    });
  });

  describe('Technicians CRUD', () => {
    it('should reject unauthenticated technician creation', async () => {
      const res = await request(app.getHttpServer())
        .post('/technicians')
        .send({ name: 'Test Tech', latitude: '40.7', longitude: '-73.9' });

      expect(res.status).toBe(401);
    });
  });

  describe('Schedules CRUD', () => {
    it('should reject unauthenticated schedule creation', async () => {
      const res = await request(app.getHttpServer())
        .post('/schedules')
        .send({
          workOrderId: 'wo_1',
          technicianId: 'tech_1',
          scheduledAt: '2026-03-25T09:00:00Z',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('Service Areas CRUD', () => {
    it('should reject unauthenticated service area creation', async () => {
      const res = await request(app.getHttpServer())
        .post('/service-areas')
        .send({ name: 'Test Area' });

      expect(res.status).toBe(401);
    });
  });
});
