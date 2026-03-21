import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
} from './helpers';

describe('Auth Flow (integration)', () => {
  let prisma: PrismaClient;
  let companyId: string;

  beforeAll(async () => {
    prisma = getTestPrisma();
    await prisma.$connect();
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const company = await createTestCompany(prisma, { slug: `auth-test-${Date.now()}` });
    companyId = company.id;
  });

  it('should hash passwords with bcrypt', async () => {
    const plainPassword = 'securePassword123';
    const hashed = await bcrypt.hash(plainPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: `hash-test-${Date.now()}@test.com`,
        name: 'Hash Test',
        password: hashed,
        companyId,
      },
    });

    expect(user.password).not.toBe(plainPassword);
    const matches = await bcrypt.compare(plainPassword, user.password);
    expect(matches).toBe(true);
  });

  it('should reject wrong password comparison', async () => {
    const hashed = await bcrypt.hash('correctPassword', 10);
    const user = await prisma.user.create({
      data: {
        email: `wrong-pw-${Date.now()}@test.com`,
        name: 'Wrong PW',
        password: hashed,
        companyId,
      },
    });

    const matches = await bcrypt.compare('wrongPassword', user.password);
    expect(matches).toBe(false);
  });

  it('should enforce unique email constraint', async () => {
    const email = `unique-${Date.now()}@test.com`;
    await prisma.user.create({
      data: { email, name: 'User 1', password: 'hash1', companyId },
    });

    await expect(
      prisma.user.create({
        data: { email, name: 'User 2', password: 'hash2', companyId },
      }),
    ).rejects.toThrow();
  });

  it('should create user with default DISPATCHER role', async () => {
    const user = await prisma.user.create({
      data: {
        email: `default-role-${Date.now()}@test.com`,
        name: 'Default Role',
        password: 'hash',
        companyId,
      },
    });

    expect(user.role).toBe('DISPATCHER');
  });

  it('should create user with specific role', async () => {
    const user = await prisma.user.create({
      data: {
        email: `admin-${Date.now()}@test.com`,
        name: 'Admin User',
        password: 'hash',
        companyId,
        role: 'ADMIN',
      },
    });

    expect(user.role).toBe('ADMIN');
  });

  it('should find user by email for login flow', async () => {
    const email = `findme-${Date.now()}@test.com`;
    const hashed = await bcrypt.hash('mypassword', 10);

    await prisma.user.create({
      data: { email, name: 'Find Me', password: hashed, companyId },
    });

    const found = await prisma.user.findUnique({ where: { email } });
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Find Me');
    expect(found!.companyId).toBe(companyId);

    const valid = await bcrypt.compare('mypassword', found!.password);
    expect(valid).toBe(true);
  });

  it('should return null for non-existent email', async () => {
    const found = await prisma.user.findUnique({
      where: { email: 'nonexistent@test.com' },
    });
    expect(found).toBeNull();
  });

  it('should associate user with company', async () => {
    const user = await prisma.user.create({
      data: {
        email: `assoc-${Date.now()}@test.com`,
        name: 'Company User',
        password: 'hash',
        companyId,
      },
    });

    const userWithCompany = await prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true },
    });

    expect(userWithCompany!.company.id).toBe(companyId);
  });
});
