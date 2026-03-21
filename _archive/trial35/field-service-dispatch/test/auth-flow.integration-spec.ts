import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
} from './helpers';

describe('Auth Flow (Integration)', () => {
  let prisma: PrismaClient;
  let companyId: string;

  beforeAll(async () => {
    prisma = await getTestPrisma();
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const company = await createTestCompany(prisma, { name: 'Auth Co', slug: 'auth-co' });
    companyId = company.id;
  });

  it('should register a user with hashed password', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'register@test.com',
        password: hashedPassword,
        name: 'New User',
        companyId,
      },
    });

    expect(user.email).toBe('register@test.com');
    expect(user.password).not.toBe('password123');
    expect(await bcrypt.compare('password123', user.password)).toBe(true);
  });

  it('should verify password on login', async () => {
    const hashedPassword = await bcrypt.hash('mypassword', 10);
    await prisma.user.create({
      data: {
        email: 'login@test.com',
        password: hashedPassword,
        name: 'Login User',
        companyId,
      },
    });

    const user = await prisma.user.findUnique({ where: { email: 'login@test.com' } });
    expect(user).not.toBeNull();
    expect(await bcrypt.compare('mypassword', user!.password)).toBe(true);
    expect(await bcrypt.compare('wrongpassword', user!.password)).toBe(false);
  });

  it('should enforce unique email across users', async () => {
    await prisma.user.create({
      data: {
        email: 'dupe@test.com',
        password: 'hash1',
        name: 'User A',
        companyId,
      },
    });

    await expect(
      prisma.user.create({
        data: {
          email: 'dupe@test.com',
          password: 'hash2',
          name: 'User B',
          companyId,
        },
      }),
    ).rejects.toThrow();
  });

  it('should store correct user role', async () => {
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: 'hash',
        name: 'Admin',
        role: 'ADMIN',
        companyId,
      },
    });

    const tech = await prisma.user.create({
      data: {
        email: 'tech@test.com',
        password: 'hash',
        name: 'Technician User',
        role: 'TECHNICIAN',
        companyId,
      },
    });

    expect(admin.role).toBe('ADMIN');
    expect(tech.role).toBe('TECHNICIAN');
  });

  it('should associate user with correct company', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'assoc@test.com',
        password: 'hash',
        name: 'Associated',
        companyId,
      },
    });

    const fetched = await prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true },
    });

    expect(fetched!.company.id).toBe(companyId);
    expect(fetched!.company.name).toBe('Auth Co');
  });

  it('should default user role to DISPATCHER', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'default@test.com',
        password: 'hash',
        name: 'Default Role',
        companyId,
      },
    });

    expect(user.role).toBe('DISPATCHER');
  });
});
