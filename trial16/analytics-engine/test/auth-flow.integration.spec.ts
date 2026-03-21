import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'crypto';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let baseUrl: string;
  const tenantId = uuidv4 ? '550e8400-e29b-41d4-a716-446655440000' : '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address() as { port: number };
    baseUrl = `http://localhost:${address.port}`;

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'authtest-' } },
    });
    await app.close();
  });

  it('should register a new user and receive a JWT', async () => {
    const email = `authtest-${Date.now()}@example.com`;

    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'securePassword123',
        name: 'Test User',
        tenantId,
      }),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.accessToken).toBeDefined();
    expect(body.user.email).toBe(email);
    expect(body.user.tenantId).toBe(tenantId);
  });

  it('should login with valid credentials', async () => {
    const email = `authtest-login-${Date.now()}@example.com`;

    await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'securePassword123',
        name: 'Login User',
        tenantId,
      }),
    });

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'securePassword123',
      }),
    });

    expect(loginResponse.status).toBe(201);
    const body = await loginResponse.json();
    expect(body.accessToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const email = `authtest-wrong-${Date.now()}@example.com`;

    await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'securePassword123',
        name: 'Wrong Pass User',
        tenantId,
      }),
    });

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'wrongPassword',
      }),
    });

    expect(loginResponse.status).toBe(401);
  });

  it('should reject duplicate registration', async () => {
    const email = `authtest-dup-${Date.now()}@example.com`;

    await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'securePassword123',
        name: 'Dup User',
        tenantId,
      }),
    });

    const dupResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'securePassword123',
        name: 'Dup User 2',
        tenantId,
      }),
    });

    expect(dupResponse.status).toBe(409);
  });
});
