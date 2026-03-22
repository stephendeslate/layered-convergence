// TRACED:AE-SECURITY-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security (e2e)', () => {
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

  describe('Authentication enforcement', () => {
    it('should require auth for events endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/events');
      expect(response.status).toBe(401);
    });

    it('should require auth for dashboards endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/dashboards');
      expect(response.status).toBe(401);
    });

    it('should require auth for data-sources endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/data-sources');
      expect(response.status).toBe(401);
    });

    it('should require auth for pipelines endpoint', async () => {
      const response = await request(app.getHttpServer()).get('/pipelines');
      expect(response.status).toBe(401);
    });
  });

  describe('Input validation', () => {
    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'hacker@test.com',
          password: 'password123',
          name: 'Hacker',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(400);
    });

    it('should strip unknown fields from registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'pw',
          name: 'Test',
          role: 'USER',
          tenantId: 'tid',
          isAdmin: true,
          extraField: 'injection',
        });

      expect(response.status).toBe(400);
    });

    it('should reject oversized string fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'x'.repeat(300) + '@test.com',
          password: 'password123',
          name: 'Test',
          role: 'USER',
          tenantId: 'tenant-1',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Health endpoints bypass auth', () => {
    it('should allow unauthenticated access to /health', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should allow unauthenticated access to /metrics', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');
      expect(response.status).toBe(200);
    });
  });

  describe('Error sanitization', () => {
    it('should not expose stack traces in error responses', async () => {
      const response = await request(app.getHttpServer()).get(
        '/nonexistent-route',
      );

      expect(response.body.stack).toBeUndefined();
    });
  });
});
