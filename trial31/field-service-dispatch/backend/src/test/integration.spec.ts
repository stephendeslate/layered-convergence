import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';

describe('Field Service Dispatch Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    workOrder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    route: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
    },
    technician: {
      findMany: jest.fn(),
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
          email: 'test@apex.com',
          password: 'SecureP@ss1',
          role: 'ADMIN',
          companyId: 'company-1',
        })
        .expect(400);
    });

    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'SecureP@ss1',
          role: 'DISPATCHER',
          companyId: 'company-1',
        })
        .expect(400);
    });

    it('should reject registration with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@apex.com',
          password: 'short',
          role: 'DISPATCHER',
          companyId: 'company-1',
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

  describe('GET /work-orders', () => {
    it('should return work orders for company', async () => {
      mockPrisma.workOrder.findMany.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/work-orders?companyId=c1')
        .expect(200)
        .expect([]);
    });
  });

  describe('GET /invoices', () => {
    it('should return invoices for company', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/invoices?companyId=c1')
        .expect(200)
        .expect([]);
    });
  });

  describe('GET /routes', () => {
    it('should return routes for company', async () => {
      mockPrisma.route.findMany.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/routes?companyId=c1')
        .expect(200)
        .expect([]);
    });
  });
});
