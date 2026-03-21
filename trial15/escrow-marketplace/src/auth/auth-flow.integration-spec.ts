import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Auth Flow Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);

    // Clean up
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.stripeAccount.deleteMany();
    await prisma.webhookEvent.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.stripeAccount.deleteMany();
    await prisma.webhookEvent.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'af-newuser@test.com',
        password: 'password123',
        name: 'New User',
        role: 'BUYER',
      });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('af-newuser@test.com');
    expect(res.body.user.name).toBe('New User');
    expect(res.body.user.role).toBe('BUYER');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('should reject duplicate registration', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'af-newuser@test.com',
        password: 'password456',
        name: 'Duplicate User',
        role: 'BUYER',
      });

    expect(res.status).toBe(409);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'af-newuser@test.com',
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('af-newuser@test.com');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'af-newuser@test.com',
        password: 'wrong-password',
      });

    expect(res.status).toBe(401);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123',
      });

    expect(res.status).toBe(401);
  });

  it('should access protected endpoint with valid token', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'af-newuser@test.com',
        password: 'password123',
      });

    const token = loginRes.body.accessToken;

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('af-newuser@test.com');
  });

  it('should reject protected endpoint without token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me');

    expect(res.status).toBe(401);
  });

  it('should reject protected endpoint with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('should reject protected endpoint with malformed auth header', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'NotBearer sometoken');

    expect(res.status).toBe(401);
  });

  it('should register users with different roles', async () => {
    const sellerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'af-seller@test.com',
        password: 'password123',
        name: 'Seller User',
        role: 'SELLER',
      });

    expect(sellerRes.status).toBe(201);
    expect(sellerRes.body.user.role).toBe('SELLER');

    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'af-admin@test.com',
        password: 'password123',
        name: 'Admin User',
        role: 'ADMIN',
      });

    expect(adminRes.status).toBe(201);
    expect(adminRes.body.user.role).toBe('ADMIN');
  });

  it('should use token from registration to access protected routes', async () => {
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'af-tokentest@test.com',
        password: 'password123',
        name: 'Token Test',
        role: 'BUYER',
      });

    const token = regRes.body.accessToken;

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('af-tokentest@test.com');
  });

  it('should create transaction with authenticated user as buyer', async () => {
    // Register buyer and seller
    const buyerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'af-newuser@test.com', password: 'password123' });

    const sellerUser = await prisma.user.findUnique({
      where: { email: 'af-seller@test.com' },
    });

    const txnRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerLogin.body.accessToken}`)
      .send({
        amount: 99.99,
        description: 'Auth flow transaction test',
        sellerId: sellerUser!.id,
      });

    expect(txnRes.status).toBe(201);
    expect(txnRes.body.buyerId).toBeDefined();
    expect(txnRes.body.sellerId).toBe(sellerUser!.id);
    expect(txnRes.body.status).toBe('PENDING');
  });

  it('should reject transaction creation without auth', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        amount: 100,
        description: 'No auth test',
        sellerId: 'some-seller-id',
      });

    expect(res.status).toBe(401);
  });
});
