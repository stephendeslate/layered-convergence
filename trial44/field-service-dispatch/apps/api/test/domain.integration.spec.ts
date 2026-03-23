// TRACED: FD-DOMAIN-INTEGRATION-SPEC
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

  describe('Work Orders', () => {
    it('should reject work order creation with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject work order with extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .send({
          title: 'Test',
          description: 'Test description',
          latitude: 40.7128,
          longitude: -74.006,
          address: '123 Main St',
          tenantId: 'tenant-1',
          extraField: 'bad',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Technicians', () => {
    it('should reject technician creation with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/technicians')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('Schedules', () => {
    it('should reject schedule creation with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('Service Areas', () => {
    it('should reject service area creation with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/service-areas')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject service area with non-whitelisted fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/service-areas')
        .send({
          name: 'Test Area',
          zipCodes: ['10001'],
          latitude: 40.7831,
          longitude: -73.9712,
          radius: 10,
          tenantId: 'tenant-1',
          hackerField: 'evil',
        });

      expect(response.status).toBe(400);
    });
  });
});
