// TRACED: EM-TDOM-001
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Domain Integration (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        listing: {
          create: jest.fn().mockResolvedValue({
            id: 'listing-1',
            title: 'Test Listing',
            description: 'Test',
            price: 100,
            status: 'DRAFT',
            sellerId: 'user-1',
            tenantId: 'tenant-1',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockResolvedValue(null),
          count: jest.fn().mockResolvedValue(0),
        },
        escrow: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        transaction: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        dispute: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
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

  describe('GET /listings', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/listings');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /transactions', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/transactions');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /escrows', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/escrows');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /disputes', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/disputes');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /listings', () => {
    it('should require authentication for create', async () => {
      const response = await request(app.getHttpServer())
        .post('/listings')
        .send({
          title: 'Test',
          description: 'Test',
          price: 100,
          tenantId: 'tenant-1',
        });
      expect(response.status).toBe(401);
    });
  });
});
