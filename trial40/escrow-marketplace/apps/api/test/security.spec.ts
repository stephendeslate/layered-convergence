// TRACED: EM-TEST-006 — Security tests with supertest
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

describe('Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
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

  it('should set Helmet security headers', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('should set Content-Security-Policy header', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('should reject invalid input in register endpoint', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'short',
        name: 'Test',
        role: 'INVALID_ROLE',
        tenantId: 'tenant-1',
      })
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('should reject XSS in string fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: '<script>alert("xss")</script>password123',
        name: '<img src=x onerror=alert(1)>',
        role: 'BUYER',
        tenantId: 'tenant-1',
      });

    // Should not return 200 with XSS content processed
    expect(response.status).not.toBe(200);
  });

  it('should require auth for protected endpoints', async () => {
    await request(app.getHttpServer())
      .get('/listings')
      .expect(401);

    await request(app.getHttpServer())
      .get('/transactions')
      .expect(401);
  });
});
