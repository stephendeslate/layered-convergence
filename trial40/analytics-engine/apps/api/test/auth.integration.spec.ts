// TRACED:AE-TEST-04 — Auth integration tests with supertest
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

  it('POST /auth/login should reject missing credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('POST /auth/register should reject ADMIN role', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin-attempt@test.com',
        password: 'password123',
        name: 'Hacker',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      })
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('POST /auth/register should reject invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
        name: 'Test',
        role: 'EDITOR',
        tenantId: 'tenant-1',
      })
      .expect(400);
  });

  it('GET /auth/profile should require auth', async () => {
    await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(401);
  });
});
