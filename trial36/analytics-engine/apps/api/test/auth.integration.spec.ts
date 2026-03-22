// TRACED: AE-TEST-002
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('Auth Integration', () => {
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
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          name: 'Test',
          role: 'ANALYST',
          tenantSlug: 'acme',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'short',
          name: 'Test',
          role: 'ANALYST',
          tenantSlug: 'acme',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          name: 'Admin Attempt',
          role: 'ADMIN',
          tenantSlug: 'acme',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with missing credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    it('should reject unauthenticated request', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
