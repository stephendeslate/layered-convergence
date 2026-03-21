import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter.js';

describe('Auth Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "transaction_state_histories", "disputes", "payouts", "webhook_logs", "transactions", "stripe_connected_accounts", "users" CASCADE`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests to protected endpoints', async () => {
    await request(app.getHttpServer())
      .get('/transactions')
      .expect(401);
  });

  it('should reject requests with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', 'Bearer invalidtoken123')
      .expect(401);
  });

  it('should allow authenticated requests', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@test.com', name: 'User', password: 'pass123', role: 'BUYER' })
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${registerRes.body.token}`)
      .expect(200);

    expect(Array.isArray(body)).toBe(true);
  });

  it('should register and login successfully', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'login@test.com', name: 'Login User', password: 'pass123', role: 'BUYER' })
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@test.com', password: 'pass123' })
      .expect(201);

    expect(body.token).toBeDefined();
    expect(body.email).toBe('login@test.com');
  });
});
