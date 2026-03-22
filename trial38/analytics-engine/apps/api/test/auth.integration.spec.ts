// TRACED: AE-TEST-05
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Integration (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        tenant: {
          create: jest.fn(),
        },
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

  describe('POST /auth/register', () => {
    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'securepassword123',
          name: 'Test User',
          role: 'EDITOR',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with disallowed role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securepassword123',
          name: 'Test User',
          role: 'ADMIN',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with extra unknown fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securepassword123',
          name: 'Test User',
          role: 'EDITOR',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
          role: 'EDITOR',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid',
          password: 'somepassword',
        });

      expect(response.status).toBe(400);
    });
  });
});
