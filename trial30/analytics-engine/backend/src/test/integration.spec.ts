import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';

describe('Analytics Engine Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    pipeline: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    dashboard: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    widget: {
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
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

  describe('GET /auth/health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/auth/health')
        .expect(200)
        .expect({ status: 'ok' });
    });
  });

  describe('POST /auth/register', () => {
    it('should reject registration with ADMIN role', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecureP@ss1',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        })
        .expect(400);
    });

    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'SecureP@ss1',
          role: 'VIEWER',
          tenantId: 'tenant-1',
        })
        .expect(400);
    });

    it('should reject registration with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          role: 'VIEWER',
          tenantId: 'tenant-1',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with invalid body', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'bad' })
        .expect(400);
    });
  });

  describe('GET /pipelines', () => {
    it('should return pipelines for tenant', async () => {
      mockPrisma.pipeline.findMany.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/pipelines?tenantId=t1')
        .expect(200)
        .expect([]);
    });
  });

  describe('GET /dashboards', () => {
    it('should return dashboards for tenant', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/dashboards?tenantId=t1')
        .expect(200)
        .expect([]);
    });
  });
});
