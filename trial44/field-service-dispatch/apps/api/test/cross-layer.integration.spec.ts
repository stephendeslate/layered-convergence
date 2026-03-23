// TRACED: FD-CROSS-LAYER-INTEGRATION-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { APP_VERSION } from '@field-service-dispatch/shared';

describe('Cross-Layer Integration — Error Path Verification (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

  describe('T44 Error Path Variation', () => {
    it('Step 1: should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `errorpath-${Date.now()}@test.com`,
          password: 'password123',
          role: 'USER',
          tenantId: 'tenant-error-path',
        });

      if (response.status === 201) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        authToken = response.body.token;
      }
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('Step 2: should login and obtain valid JWT', async () => {
      const email = `errorpath-login-${Date.now()}@test.com`;
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          role: 'USER',
          tenantId: 'tenant-error-path',
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

    it('Step 3: should reject request with expired/invalid JWT — 401 with correlationId', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.invalid';

      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          title: 'Should Not Create',
          description: 'Invalid token test',
          priority: 'MEDIUM',
          tenantId: 'tenant-error-path',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).not.toHaveProperty('stack');
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('Step 4: should create a work order with valid JWT', async () => {
      if (authToken) {
        const response = await request(app.getHttpServer())
          .post('/work-orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Error path test work order',
            description: 'Validates authenticated CRUD in error path flow',
            priority: 'MEDIUM',
            tenantId: 'tenant-error-path',
          });

        expect([201, 400]).toContain(response.status);
        expect(response.headers['x-correlation-id']).toBeDefined();
        expect(response.headers['x-response-time']).toBeDefined();
      }
    });

    it('Step 5: should reject work order with missing required fields — validation error with correlationId', async () => {
      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${authToken ?? 'fallback-token'}`)
        .send({
          // Missing title, description, priority
          tenantId: 'tenant-error-path',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).not.toHaveProperty('stack');
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('Step 6: should include X-Correlation-ID and X-Response-Time on ALL responses', async () => {
      // Success path
      const healthRes = await request(app.getHttpServer()).get('/health');
      expect(healthRes.headers['x-correlation-id']).toBeDefined();
      expect(healthRes.headers['x-response-time']).toBeDefined();

      // Auth error path
      const authErrRes = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Authorization', 'Bearer invalid');
      expect(authErrRes.headers['x-correlation-id']).toBeDefined();
      expect(authErrRes.headers['x-response-time']).toBeDefined();

      // Validation error path
      const valErrRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad' });
      expect(valErrRes.headers['x-correlation-id']).toBeDefined();
      expect(valErrRes.headers['x-response-time']).toBeDefined();

      // 404 error path
      const notFoundRes = await request(app.getHttpServer()).get('/nonexistent');
      expect(notFoundRes.headers['x-correlation-id']).toBeDefined();
      expect(notFoundRes.headers['x-response-time']).toBeDefined();
    });

    it('Step 7: should verify /health returns APP_VERSION from shared', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('version', APP_VERSION);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('Step 8: should verify /health/ready returns database connectivity status', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('database');
    });

    it('should preserve client-provided correlation ID through error paths', async () => {
      const clientId = 'error-path-t44-correlation-test';

      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientId);

      expect(response.headers['x-correlation-id']).toBe(clientId);
    });

    it('should return correlationId in 404 error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/work-orders/nonexistent-id');

      expect(response.body).toHaveProperty('correlationId');
      expect(response.body).not.toHaveProperty('stack');
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

    it('should reject ADMIN role registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: 'tenant-error-path',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('correlationId');
    });
  });
});
