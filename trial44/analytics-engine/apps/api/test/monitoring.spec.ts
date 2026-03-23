import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:AE-TEST-006
describe('Monitoring Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.version).toBeDefined();
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /health/ready', () => {
    it('should return database readiness', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.database).toBe('connected');
    });
  });

  describe('Correlation ID', () => {
    it('should generate correlation ID when not provided', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should preserve client correlation ID', async () => {
      const clientId = 'client-correlation-123';
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', clientId);

      expect(response.headers['x-correlation-id']).toBe(clientId);
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics without auth', async () => {
      const response = await request(app.getHttpServer()).get('/metrics');

      expect(response.status).toBe(200);
      expect(response.body.requestCount).toBeDefined();
      expect(response.body.errorCount).toBeDefined();
      expect(response.body.averageResponseTime).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('Error sanitization', () => {
    it('should not expose stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.body.stack).toBeUndefined();
      expect(response.body.statusCode).toBeDefined();
    });

    it('should include correlation ID in error responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.headers['x-correlation-id']).toBeDefined();
    });
  });

  describe('Response Time', () => {
    it('should include X-Response-Time header', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/\d+ms/);
    });
  });
});
