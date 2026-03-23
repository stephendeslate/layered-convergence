import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:AE-TEST-008
describe('Performance Integration (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        event: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        dashboard: {
          findMany: jest.fn().mockResolvedValue([]),
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

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'USER',
      tenantId: 'tenant-1',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Response Time Header', () => {
    it('should include X-Response-Time header on all responses', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.headers['x-response-time']).toBeDefined();
      expect(response.headers['x-response-time']).toMatch(/^\d+ms$/);
    });

    it('should include X-Response-Time on authenticated endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .query({ tenantId: 'tenant-1' })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.headers['x-response-time']).toBeDefined();
    });
  });

  describe('Cache-Control Headers', () => {
    it('should set Cache-Control on list endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .query({ tenantId: 'tenant-1' })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.headers['cache-control']).toContain('max-age');
    });
  });

  describe('Pagination Clamping', () => {
    it('should clamp excessive page sizes', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .query({ tenantId: 'tenant-1', pageSize: '9999' })
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pageSize).toBeLessThanOrEqual(100);
    });
  });

  describe('Health endpoint performance', () => {
    it('should respond within 200ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer()).get('/health');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });
});
