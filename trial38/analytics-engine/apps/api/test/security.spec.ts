// TRACED: AE-DB-01
// TRACED: AE-DB-02
// TRACED: AE-DB-03
// TRACED: AE-DB-04
// TRACED: AE-DB-05
// TRACED: AE-DB-06
// TRACED: AE-INFRA-03
// TRACED: AE-INFRA-04
// TRACED: AE-INFRA-05
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Security and Configuration Verification', () => {
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
        dashboard: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        pipeline: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
          },
        },
      }),
    );

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

  describe('Helmet Security Headers', () => {
    it('should include x-content-type-options header', async () => {
      const response = await request(app.getHttpServer()).get('/');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include x-frame-options header', async () => {
      const response = await request(app.getHttpServer()).get('/');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('should include content-security-policy header', async () => {
      const response = await request(app.getHttpServer()).get('/');
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });
  });

  describe('Input Validation', () => {
    it('should reject registration with an invalid email', async () => {
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

    it('should reject registration with non-whitelisted fields', async () => {
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

    it('should reject ADMIN role in registration', async () => {
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
  });
});
