// [TRACED:TS-002] Integration tests using real DB via Test.createTestingModule
// [TRACED:TS-003] No jest.spyOn mocking of Prisma - uses real modules

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;

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

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant', slug: 'test-tenant' },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    await app.close();
  });

  it('should register a new user with VIEWER role', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'viewer@test.com',
        password: 'password123',
        role: 'VIEWER',
        tenantId,
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
  });

  it('should register a new user with ANALYST role', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'analyst@test.com',
        password: 'password123',
        role: 'ANALYST',
        tenantId,
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
  });

  it('should reject registration with ADMIN role', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN',
        tenantId,
      })
      .expect(400);
  });

  it('should login with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'viewer@test.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
  });

  it('should reject login with invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'viewer@test.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });
});
