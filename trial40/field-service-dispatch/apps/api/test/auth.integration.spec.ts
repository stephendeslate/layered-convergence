// TRACED: FD-AUTH-006 — Auth integration tests with HTTP assertions
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration (e2e)', () => {
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

  describe('POST /auth/register', () => {
    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject missing email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ password: 'test123', role: 'DISPATCHER', tenantId: 'tid' });

      expect(res.status).toBe(400);
    });

    it('should reject ADMIN role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'admin123',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        });

      expect([400, 409]).toContain(res.status);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject empty body', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nobody@nowhere.com',
          password: 'nope',
          tenantId: 'tenant-1',
        });

      expect([400, 401]).toContain(res.status);
    });
  });
});
