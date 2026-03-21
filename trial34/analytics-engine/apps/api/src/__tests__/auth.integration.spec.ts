import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

// TRACED: AE-TA-INT-001 — Auth integration tests with supertest
describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register should reject ADMIN role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin Test',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      });

    expect(res.status).toBe(400);
  });

  it('POST /auth/register should reject invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
        name: 'Test',
        tenantId: 'tenant-1',
        role: 'ANALYST',
      });

    expect(res.status).toBe(400);
  });

  it('POST /auth/login should reject missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });

  it('GET /auth/profile should require authentication', async () => {
    const res = await request(app.getHttpServer()).get('/auth/profile');

    expect(res.status).toBe(401);
  });
});
