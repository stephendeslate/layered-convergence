// TRACED:AE-SEC-05 — Security tests with supertest HTTP assertions
// TRACED:AE-SEC-06 — CSP and security headers verification
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

  it('should set security headers', async () => {
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

    const csp = response.headers['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('should strip unknown properties from request body', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password',
        hackerField: 'injected',
      })
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('should reject oversized strings in DTOs', async () => {
    const longString = 'a'.repeat(300);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `${longString}@test.com`,
        password: 'password123',
        name: 'Test',
        role: 'EDITOR',
        tenantId: 'tenant-1',
      })
      .expect(400);
  });
});
