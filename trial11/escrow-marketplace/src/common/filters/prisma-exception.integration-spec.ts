import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

describe('PrismaExceptionFilter Integration', () => {
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

  it('should return 409 on duplicate email registration', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'duplicate@test.com', name: 'User 1', password: 'pass123', role: 'BUYER' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'duplicate@test.com', name: 'User 2', password: 'pass456', role: 'BUYER' })
      .expect(409);
  });

  it('should return 404 for non-existent transaction', async () => {
    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@test.com', name: 'User', password: 'pass123', role: 'BUYER' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/transactions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${userRes.body.token}`)
      .expect(404);
  });
});
