import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import {
  cleanDatabase,
  teardown,
  createTestCompany,
} from './helpers';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should register a new user and return a token', async () => {
    const company = await createTestCompany();

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new@test.com',
        password: 'password123',
        name: 'Test User',
        companyId: company.id,
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('should login with valid credentials', async () => {
    const company = await createTestCompany();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'login@test.com',
        password: 'password123',
        name: 'Login User',
        companyId: company.id,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'login@test.com',
        password: 'password123',
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const company = await createTestCompany();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'wrong@test.com',
        password: 'password123',
        name: 'Wrong User',
        companyId: company.id,
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrong@test.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('should reject login with non-existent email', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123',
      })
      .expect(401);
  });

  it('should reject requests without token', async () => {
    await request(app.getHttpServer())
      .get('/technicians')
      .expect(401);
  });

  it('should reject requests with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('should access protected endpoints with valid token', async () => {
    const company = await createTestCompany();

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'protected@test.com',
        password: 'password123',
        name: 'Protected User',
        companyId: company.id,
      })
      .expect(201);

    const token = registerRes.body.accessToken;

    await request(app.getHttpServer())
      .get('/technicians')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should reject registration with duplicate email', async () => {
    const company = await createTestCompany();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dupe@test.com',
        password: 'password123',
        name: 'First User',
        companyId: company.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dupe@test.com',
        password: 'password123',
        name: 'Second User',
        companyId: company.id,
      })
      .expect(409);
  });
});
