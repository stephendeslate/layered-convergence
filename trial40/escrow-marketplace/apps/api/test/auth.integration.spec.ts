// TRACED: EM-TEST-004 — Auth integration tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register should validate required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({})
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('POST /auth/register should reject ADMIN role', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin User',
        role: 'ADMIN',
        tenantId: '00000000-0000-0000-0000-000000000001',
      })
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('POST /auth/login should validate required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('POST /auth/register should reject non-whitelisted fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        role: 'BUYER',
        tenantId: '00000000-0000-0000-0000-000000000001',
        isAdmin: true,
      })
      .expect(400);

    expect(response.body.message).toBeDefined();
  });
});
