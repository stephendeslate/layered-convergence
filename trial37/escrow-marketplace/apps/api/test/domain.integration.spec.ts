import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED: EM-TEST-002 — Integration tests for domain endpoints with supertest

describe('Domain Integration', () => {
  let app: INestApplication;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    listing: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    escrowAccount: {
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
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

  describe('Listings', () => {
    it('should return 401 for unauthenticated GET /listings', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings');

      expect(response.status).toBe(401);
    });

    it('should return 401 for unauthenticated POST /listings', async () => {
      const response = await request(app.getHttpServer())
        .post('/listings')
        .send({ title: 'Test', description: 'Desc', price: 10.00 });

      expect(response.status).toBe(401);
    });

    it('should return 401 for unauthenticated PATCH /listings/:id', async () => {
      const response = await request(app.getHttpServer())
        .patch('/listings/some-id')
        .send({ title: 'Updated' });

      expect(response.status).toBe(401);
    });
  });

  describe('Transactions', () => {
    it('should return 401 for unauthenticated GET /transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions');

      expect(response.status).toBe(401);
    });

    it('should return 401 for unauthenticated POST /transactions', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({ listingId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(response.status).toBe(401);
    });

    it('should return 401 for unauthenticated PATCH /transactions/:id/status', async () => {
      const response = await request(app.getHttpServer())
        .patch('/transactions/some-id/status')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(401);
    });
  });

  describe('Health', () => {
    it('should return health check status', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
