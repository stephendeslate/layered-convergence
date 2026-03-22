// TRACED: EM-TEST-005 — Domain integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Domain Integration (E2E)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let prismaService: {
    listing: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock; count: jest.Mock };
    transaction: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock; count: jest.Mock };
    escrowAccount: { create: jest.Mock; deleteMany: jest.Mock };
    dispute: { create: jest.Mock; deleteMany: jest.Mock };
    $transaction: jest.Mock;
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    onModuleInit: jest.Mock;
    onModuleDestroy: jest.Mock;
  };

  beforeAll(async () => {
    prismaService = {
      listing: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      transaction: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      escrowAccount: { create: jest.fn(), deleteMany: jest.fn() },
      dispute: { create: jest.fn(), deleteMany: jest.fn() },
      $transaction: jest.fn((fn) => fn(prismaService)),
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
    };

    process.env.JWT_SECRET = 'test-domain-integration-secret';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
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

    const jwtService = app.get<JwtService>(JwtService);
    jwtToken = jwtService.sign({
      sub: 'user-001',
      email: 'test@test.com',
      role: 'SELLER',
      tenantId: 'tenant-001',
    });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /listings', () => {
    it('should return paginated listings with auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?tenantId=tenant-001')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?tenantId=tenant-001');

      expect(response.status).toBe(401);
    });

    it('should set Cache-Control header on listings list', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings?tenantId=tenant-001')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.headers['cache-control']).toContain('public');
    });
  });

  describe('GET /transactions', () => {
    it('should return paginated transactions with auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?tenantId=tenant-001')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should set private Cache-Control for transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?tenantId=tenant-001')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.headers['cache-control']).toContain('private');
    });
  });

  describe('POST /listings', () => {
    it('should reject listing creation with invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
    });
  });
});
