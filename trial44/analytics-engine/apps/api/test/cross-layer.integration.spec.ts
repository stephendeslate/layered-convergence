import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS, APP_VERSION } from '@analytics-engine/shared';

// TRACED:AE-CROSS-007
describe('Cross-Layer Integration — Error Path Verification (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let validToken: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findFirst: jest.fn().mockImplementation(({ where }: { where: { email: string } }) => {
            if (where.email === 'errorpath@test.com') {
              return Promise.resolve({
                id: 'user-err-1',
                email: 'errorpath@test.com',
                passwordHash,
                role: 'USER',
                tenantId: 'tenant-err-1',
                tenant: { id: 'tenant-err-1', name: 'Error Path Tenant' },
              });
            }
            if (where.email === 'newpath@test.com') {
              return Promise.resolve(null);
            }
            return Promise.resolve(null);
          }),
          create: jest.fn().mockResolvedValue({
            id: 'user-err-2',
            email: 'newpath@test.com',
            role: 'USER',
            tenantId: 'tenant-err-1',
          }),
        },
        dashboard: {
          create: jest.fn().mockResolvedValue({
            id: 'dash-err-1',
            name: 'Error Path Dashboard',
            tenantId: 'tenant-err-1',
            userId: 'user-err-1',
          }),
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockResolvedValue(null),
          count: jest.fn().mockResolvedValue(0),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // TRACED:AE-CROSS-008
  describe('T44 Error Path Variation', () => {
    it('Step 1: should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newpath@test.com',
          password: 'password123',
          tenantId: 'tenant-err-1',
          role: 'USER',
        });

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('Step 2: should login and obtain valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'errorpath@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      validToken = response.body.accessToken;
    });

    it('Step 3: should reject request with expired/invalid JWT — 401 with correlationId', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.invalid';

      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          name: 'Should Not Create',
          tenantId: 'tenant-err-1',
        });

      expect(response.status).toBe(401);
      expect(response.body.correlationId).toBeDefined();
      expect(response.body.stack).toBeUndefined();
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('Step 4: should create a dashboard with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Error Path Dashboard',
          tenantId: 'tenant-err-1',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Error Path Dashboard');
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('Step 5: should reject invalid payload with correlationId in error response', async () => {
      const response = await request(app.getHttpServer())
        .post('/dashboards')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          tenantId: 'tenant-err-1',
          // Missing required 'name' field
        });

      expect(response.status).toBe(400);
      expect(response.body.correlationId).toBeDefined();
      expect(response.body.stack).toBeUndefined();
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
        .get('/dashboards')
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
      expect(response.body.version).toBe(APP_VERSION);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    it('Step 8: should verify /health/ready returns database connectivity status', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.database).toBeDefined();
    });

    it('should preserve client-provided correlation ID through error paths', async () => {
      const clientCorrelationId = 'error-path-test-correlation-id-t44';

      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .set('X-Correlation-ID', clientCorrelationId);

      expect(response.status).toBe(404);
      expect(response.headers['x-correlation-id']).toBe(clientCorrelationId);
      expect(response.body.correlationId).toBe(clientCorrelationId);
      expect(response.body.stack).toBeUndefined();
    });

    it('should reject ADMIN role registration with correlationId in error', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          tenantId: 'tenant-err-1',
          role: 'ADMIN',
        });

      expect(response.status).toBe(400);
      expect(response.body.correlationId).toBeDefined();
      expect(response.headers['x-correlation-id']).toBeDefined();
    });
  });
});
