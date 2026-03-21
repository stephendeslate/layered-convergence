import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';

describe('Escrow Marketplace Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    dispute: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
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
        })
        .expect(400);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid',
          password: 'SecureP@ss1',
          role: 'BUYER',
        })
        .expect(400);
    });

    it('should reject short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          role: 'BUYER',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login without password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);
    });
  });

  describe('GET /transactions', () => {
    it('should return transactions list', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/transactions')
        .expect(200)
        .expect([]);
    });
  });

  describe('GET /disputes', () => {
    it('should return disputes list', async () => {
      mockPrisma.dispute.findMany.mockResolvedValue([]);
      return request(app.getHttpServer())
        .get('/disputes')
        .expect(200)
        .expect([]);
    });
  });
});
