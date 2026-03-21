// [TRACED:TS-003] Integration tests use Test.createTestingModule with real AppModule
// [TRACED:TS-004] ZERO jest.spyOn on Prisma in integration tests

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new DISPATCHER user', async () => {
      const company = await prisma.company.create({
        data: { name: 'Test Company Auth' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'dispatcher-e2e@test.com',
          password: 'password123',
          role: 'DISPATCHER',
          companyId: company.id,
        })
        .expect(201);

      expect(response.body.email).toBe('dispatcher-e2e@test.com');
      expect(response.body.role).toBe('DISPATCHER');
    });

    it('should reject ADMIN role registration', async () => {
      const company = await prisma.company.create({
        data: { name: 'Test Company Auth 2' },
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin-e2e@test.com',
          password: 'password123',
          role: 'ADMIN',
          companyId: company.id,
        })
        .expect(400);
    });

    it('should register a TECHNICIAN user', async () => {
      const company = await prisma.company.create({
        data: { name: 'Test Company Auth 3' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'tech-e2e@test.com',
          password: 'password123',
          role: 'TECHNICIAN',
          companyId: company.id,
        })
        .expect(201);

      expect(response.body.role).toBe('TECHNICIAN');
    });
  });

  describe('POST /auth/login', () => {
    it('should return access_token on valid login', async () => {
      const company = await prisma.company.create({
        data: { name: 'Test Company Login' },
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login-e2e@test.com',
          password: 'password123',
          role: 'DISPATCHER',
          companyId: company.id,
        });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-e2e@test.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.access_token).toBeDefined();
    });

    it('should return 401 on invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
