import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:AE-TEST-007
describe('Security Integration (e2e)', () => {
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
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        user: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
        },
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

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app.getHttpServer()).get('/dashboards');
      expect(response.status).toBe(401);
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    it('should reject registration with ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          tenantId: 'tenant-1',
          role: 'ADMIN',
        });

      expect(response.status).toBe(400);
    });

    it('should reject extra fields (forbidNonWhitelisted)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123',
          extraField: 'malicious',
        });

      expect(response.status).toBe(400);
    });

    it('should reject overly long strings', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'a'.repeat(300) + '@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Health endpoints skip auth', () => {
    it('should allow /health without auth', async () => {
      const response = await request(app.getHttpServer()).get('/health');
      expect(response.status).toBe(200);
    });

    it('should allow /health/ready without auth', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');
      expect(response.status).toBe(200);
    });
  });
});
