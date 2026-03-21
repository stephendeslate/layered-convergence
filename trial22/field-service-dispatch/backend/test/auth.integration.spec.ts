// Integration tests for AuthService — REAL database, NO Prisma mocking

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService Integration', () => {
  let module: TestingModule;
  let authService: AuthService;
  let prisma: PrismaService;
  const createdCompanyIds: string[] = [];

  beforeAll(async () => {
    // Set JWT_SECRET for test environment
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-integration';

    module = await Test.createTestingModule({
      imports: [AuthModule, PrismaModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up all test data
    for (const companyId of createdCompanyIds) {
      await prisma.user.deleteMany({ where: { companyId } });
      await prisma.company.deleteMany({ where: { id: companyId } });
    }
    await module.close();
  });

  it('should register a DISPATCHER user', async () => {
    const result = await authService.register({
      email: `dispatcher-${Date.now()}@test.com`,
      password: 'securepass123',
      role: 'DISPATCHER',
      companyName: 'Test Dispatch Co',
    });

    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toContain('dispatcher');
    expect(result.user.role).toBe('DISPATCHER');
    expect(result.user.companyId).toBeDefined();
    createdCompanyIds.push(result.user.companyId);
  });

  it('should register a TECHNICIAN user', async () => {
    const result = await authService.register({
      email: `technician-${Date.now()}@test.com`,
      password: 'securepass123',
      role: 'TECHNICIAN',
      companyName: 'Test Tech Co',
    });

    expect(result.accessToken).toBeDefined();
    expect(result.user.role).toBe('TECHNICIAN');
    createdCompanyIds.push(result.user.companyId);
  });

  it('should reject ADMIN role registration (defense-in-depth)', async () => {
    await expect(
      authService.register({
        email: `admin-${Date.now()}@test.com`,
        password: 'securepass123',
        role: 'ADMIN' as 'DISPATCHER',
        companyName: 'Admin Co',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should login with valid credentials', async () => {
    const email = `login-test-${Date.now()}@test.com`;
    const password = 'securepass123';

    const registered = await authService.register({
      email,
      password,
      role: 'DISPATCHER',
      companyName: 'Login Test Co',
    });
    createdCompanyIds.push(registered.user.companyId);

    const loginResult = await authService.login({ email, password });

    expect(loginResult.accessToken).toBeDefined();
    expect(loginResult.user.email).toBe(email);
    expect(loginResult.user.role).toBe('DISPATCHER');
  });

  it('should reject login with wrong password', async () => {
    const email = `wrong-pass-${Date.now()}@test.com`;

    const registered = await authService.register({
      email,
      password: 'correctpassword',
      role: 'DISPATCHER',
      companyName: 'Wrong Pass Co',
    });
    createdCompanyIds.push(registered.user.companyId);

    await expect(
      authService.login({ email, password: 'wrongpassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login with non-existent email', async () => {
    await expect(
      authService.login({
        email: 'nonexistent@test.com',
        password: 'anypassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should create a company for each new registration', async () => {
    const result = await authService.register({
      email: `company-test-${Date.now()}@test.com`,
      password: 'securepass123',
      role: 'DISPATCHER',
      companyName: 'Unique Company Name',
    });
    createdCompanyIds.push(result.user.companyId);

    // Verify the company actually exists in the database
    const company = await prisma.company.findUnique({
      where: { id: result.user.companyId },
    });

    expect(company).toBeDefined();
    expect(company?.name).toBe('Unique Company Name');
  });

  it('should hash passwords (not store plain text)', async () => {
    const email = `hash-test-${Date.now()}@test.com`;
    const password = 'plaintextpassword';

    const registered = await authService.register({
      email,
      password,
      role: 'TECHNICIAN',
      companyName: 'Hash Test Co',
    });
    createdCompanyIds.push(registered.user.companyId);

    // findFirst: safe because email is unique
    const user = await prisma.user.findFirst({
      where: { email },
    });

    expect(user).toBeDefined();
    expect(user?.passwordHash).not.toBe(password);
    expect(user?.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
  });
});
