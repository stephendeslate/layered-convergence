// TRACED: EM-TSEC-001
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Security Integration (E2E)', () => {
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
        user: {
          create: jest.fn().mockResolvedValue({
            id: 'user-1', email: 'a@b.com', name: 'A', role: 'BUYER', tenantId: 't-1', createdAt: new Date(),
          }),
          findFirst: jest.fn().mockResolvedValue(null),
        },
        listing: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        escrow: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        transaction: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
        dispute: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
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

  describe('Helmet headers', () => {
    it('should set security headers', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should reject invalid registration payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid' });
      expect(response.status).toBe(400);
    });

    it('should reject ADMIN role registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@evil.com',
          password: 'hack123',
          name: 'Hacker',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        });
      expect(response.status).toBe(400);
    });

    it('should strip extra fields (forbidNonWhitelisted)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          role: 'BUYER',
          tenantId: 'tenant-1',
          isAdmin: true,
        });
      expect(response.status).toBe(400);
    });

    it('should require string types on DTO fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 123,
          name: 'Test',
          role: 'BUYER',
          tenantId: 'tenant-1',
        });
      expect(response.status).toBe(400);
    });
  });

  describe('Auth protection', () => {
    it('should reject unauthenticated listing access', async () => {
      const response = await request(app.getHttpServer()).get('/listings');
      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated transaction access', async () => {
      const response = await request(app.getHttpServer()).get('/transactions');
      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated escrow access', async () => {
      const response = await request(app.getHttpServer()).get('/escrows');
      expect(response.status).toBe(401);
    });

    it('should reject unauthenticated dispute access', async () => {
      const response = await request(app.getHttpServer()).get('/disputes');
      expect(response.status).toBe(401);
    });
  });
});
