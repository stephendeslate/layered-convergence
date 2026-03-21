import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

// TRACED: FD-TST-INT-001 — Integration tests with real AppModule + supertest
describe('App Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-for-integration';
    process.env.CORS_ORIGIN = 'http://localhost:3001';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /auth/register', () => {
    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /work-orders', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/work-orders');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /technicians', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/technicians');
      expect(response.status).toBe(401);
    });
  });
});
