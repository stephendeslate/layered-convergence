import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

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

  describe('GET /auth/health', () => {
    it('should return status ok', () => {
      return request(app.getHttpServer())
        .get('/auth/health')
        .expect(200)
        .expect({ status: 'ok' });
    });
  });

  describe('POST /auth/register', () => {
    it('should reject ADMIN role', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'Password123!',
          name: 'Admin User',
          role: 'ADMIN',
        })
        .expect(400);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
          name: 'Test User',
          role: 'DISPATCHER',
        })
        .expect(400);
    });

    it('should reject short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: '123',
          name: 'Test User',
          role: 'DISPATCHER',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('GET /work-orders', () => {
    it('should return an array', () => {
      return request(app.getHttpServer())
        .get('/work-orders')
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /invoices', () => {
    it('should return an array', () => {
      return request(app.getHttpServer())
        .get('/invoices')
        .expect(200)
        .then((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
