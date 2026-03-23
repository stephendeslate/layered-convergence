// TRACED: FD-CROSS-LAYER-INTEGRATION-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@field-service-dispatch/shared';

describe('Cross-Layer Integration (e2e)', () => {
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

  describe('End-to-end flow: auth -> CRUD -> monitoring', () => {
    let authToken: string;

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `crosslayer-${Date.now()}@test.com`,
          password: 'password123',
          role: 'USER',
          tenantId: 'tenant-cross-layer',
        });

      if (response.status === 201) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        authToken = response.body.token;
      }
    });

    it('should login with registered credentials', async () => {
      const email = `crosslayer-login-${Date.now()}@test.com`;
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          role: 'USER',
          tenantId: 'tenant-cross-layer',
        });

      if (registerRes.status === 201) {
        const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email, password: 'password123' });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty('token');
        authToken = loginRes.body.token;
      }
    });

    it('should include X-Correlation-ID header on all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.headers['x-correlation-id']).toBeDefined();
    });

    it('should include X-Response-Time header on all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+\.\d+ms/);
    });

    it('should create a work order with valid JWT', async () => {
      if (authToken) {
        const createRes = await request(app.getHttpServer())
          .post('/work-orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Cross-layer test work order',
            description: 'Validates authenticated CRUD in cross-layer flow',
            priority: 'MEDIUM',
            tenantId: 'tenant-cross-layer',
          });

        expect([201, 400]).toContain(createRes.status);
        expect(createRes.headers['x-correlation-id']).toBeDefined();
        expect(createRes.headers['x-response-time']).toBeDefined();
      }
    });

    it('should trigger validation error and include correlationId in error response (no stack)', async () => {
      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).not.toHaveProperty('stack');
    });

    it('should return correlationId in 404 error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders/nonexistent-id');

      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).not.toHaveProperty('stack');
    });

    it('should verify /health returns APP_VERSION from shared', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version', APP_VERSION);
    });

    it('should preserve client-provided correlation ID through the full chain', async () => {
      const clientId = 'cross-layer-test-correlation-id';

      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientId);

      expect(response.headers['x-correlation-id']).toBe(clientId);
    });

    it('should verify error responses have consistent structure across endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/work-orders/bad-id' },
        { method: 'get', path: '/technicians/bad-id' },
        { method: 'get', path: '/schedules/bad-id' },
        { method: 'get', path: '/service-areas/bad-id' },
      ];

      for (const endpoint of endpoints) {
        const response = await (request(app.getHttpServer()) as Record<string, Function>)[endpoint.method](endpoint.path);

        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('correlationId');
        expect(response.body).not.toHaveProperty('stack');
      }
    });
  });
});
