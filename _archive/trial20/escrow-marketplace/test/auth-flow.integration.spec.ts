import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import {
  createTestApp,
  cleanDatabase,
} from './helpers/test-app';

describe('Auth Flow Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should register a new user', async () => {
    const result = await authService.register({
      email: 'new@test.com',
      password: 'newpass123',
      role: 'BUYER' as any,
    });

    expect(result.email).toBe('new@test.com');
    expect(result.role).toBe('BUYER');
    expect(result.token).toBeDefined();
    expect(result.id).toBeDefined();
  });

  it('should login with correct credentials', async () => {
    await authService.register({
      email: 'login@test.com',
      password: 'login123',
      role: 'PROVIDER' as any,
    });

    const result = await authService.login({
      email: 'login@test.com',
      password: 'login123',
    });

    expect(result.email).toBe('login@test.com');
    expect(result.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await authService.register({
      email: 'wrongpw@test.com',
      password: 'correct123',
      role: 'BUYER' as any,
    });

    await expect(
      authService.login({
        email: 'wrongpw@test.com',
        password: 'wrong',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should reject login for non-existent user', async () => {
    await expect(
      authService.login({
        email: 'ghost@test.com',
        password: 'any',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should reject duplicate email registration', async () => {
    await authService.register({
      email: 'dup@test.com',
      password: 'pass123',
      role: 'BUYER' as any,
    });

    await expect(
      authService.register({
        email: 'dup@test.com',
        password: 'other123',
        role: 'PROVIDER' as any,
      }),
    ).rejects.toThrow('Email already registered');
  });

  it('should generate a valid base64 token that decodes to email:password', async () => {
    const result = await authService.register({
      email: 'token@test.com',
      password: 'tokenpass',
      role: 'ADMIN' as any,
    });

    const decoded = Buffer.from(result.token, 'base64').toString('utf-8');
    expect(decoded).toBe('token@test.com:tokenpass');
  });

  it('should persist user to database after registration', async () => {
    const result = await authService.register({
      email: 'persist@test.com',
      password: 'persist123',
      role: 'BUYER' as any,
    });

    const user = await prisma.user.findUnique({
      where: { email: 'persist@test.com' },
    });

    expect(user).not.toBeNull();
    expect(user!.id).toBe(result.id);
    expect(user!.role).toBe('BUYER');
  });

  it('should register users with different roles', async () => {
    const buyerResult = await authService.register({
      email: 'b@test.com',
      password: 'pass123',
      role: 'BUYER' as any,
    });
    const providerResult = await authService.register({
      email: 'p@test.com',
      password: 'pass123',
      role: 'PROVIDER' as any,
    });
    const adminResult = await authService.register({
      email: 'a@test.com',
      password: 'pass123',
      role: 'ADMIN' as any,
    });

    expect(buyerResult.role).toBe('BUYER');
    expect(providerResult.role).toBe('PROVIDER');
    expect(adminResult.role).toBe('ADMIN');
  });

  it('should return consistent token between register and login', async () => {
    const registerResult = await authService.register({
      email: 'consistent@test.com',
      password: 'same123',
      role: 'BUYER' as any,
    });

    const loginResult = await authService.login({
      email: 'consistent@test.com',
      password: 'same123',
    });

    expect(registerResult.token).toBe(loginResult.token);
  });
});
