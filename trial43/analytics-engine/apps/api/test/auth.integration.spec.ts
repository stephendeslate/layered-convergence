import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import * as bcrypt from 'bcrypt';

// TRACED:AE-TEST-004
describe('Auth Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
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

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });

      expect(response.status).toBe(401);
    });

    it('should return 200 and token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash,
        role: 'USER',
        tenantId: 'tenant-1',
        tenant: { id: 'tenant-1', name: 'Test' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should reject missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should reject ADMIN role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'password123',
          tenantId: 'tenant-1',
          role: 'ADMIN',
        });

      expect(response.status).toBe(400);
    });

    it('should reject extra fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          tenantId: 'tenant-1',
          role: 'USER',
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });
  });
});
