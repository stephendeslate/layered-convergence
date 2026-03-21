import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  createTestPool,
  createTestPrisma,
  cleanDatabase,
  createTestUser,
} from './helpers';

describe('Auth Flow (Integration)', () => {
  let pool: Pool;
  let prisma: PrismaClient;

  beforeAll(async () => {
    pool = createTestPool();
    prisma = createTestPrisma(pool);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await cleanDatabase(pool);
  });

  describe('User Registration', () => {
    it('should create a user with hashed password', async () => {
      const user = await createTestUser(prisma, {
        email: 'register@test.com',
        name: 'New User',
        password: 'securepassword',
      });

      expect(user.email).toBe('register@test.com');
      expect(user.name).toBe('New User');
      expect(user.passwordHash).not.toBe('securepassword');

      const isValid = await bcrypt.compare('securepassword', user.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should default role to BUYER', async () => {
      const user = await createTestUser(prisma, { email: 'default@test.com' });
      expect(user.role).toBe('BUYER');
    });

    it('should allow PROVIDER role', async () => {
      const user = await createTestUser(prisma, {
        email: 'provider@test.com',
        role: 'PROVIDER',
      });
      expect(user.role).toBe('PROVIDER');
    });

    it('should allow ADMIN role', async () => {
      const user = await createTestUser(prisma, {
        email: 'admin@test.com',
        role: 'ADMIN',
      });
      expect(user.role).toBe('ADMIN');
    });

    it('should reject duplicate emails', async () => {
      await createTestUser(prisma, { email: 'unique@test.com' });

      await expect(
        createTestUser(prisma, { email: 'unique@test.com' }),
      ).rejects.toThrow();
    });
  });

  describe('User Lookup', () => {
    it('should find user by email', async () => {
      await createTestUser(prisma, { email: 'lookup@test.com', name: 'Lookup User' });

      const found = await prisma.user.findUnique({
        where: { email: 'lookup@test.com' },
      });
      expect(found).not.toBeNull();
      expect(found!.name).toBe('Lookup User');
    });

    it('should return null for non-existent email', async () => {
      const found = await prisma.user.findUnique({
        where: { email: 'nonexistent@test.com' },
      });
      expect(found).toBeNull();
    });

    it('should find user by id', async () => {
      const user = await createTestUser(prisma, { email: 'byid@test.com' });

      const found = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(found).not.toBeNull();
      expect(found!.id).toBe(user.id);
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password', async () => {
      const user = await createTestUser(prisma, {
        email: 'verify@test.com',
        password: 'correctpassword',
      });

      const isValid = await bcrypt.compare('correctpassword', user.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await createTestUser(prisma, {
        email: 'wrong@test.com',
        password: 'correctpassword',
      });

      const isValid = await bcrypt.compare('wrongpassword', user.passwordHash);
      expect(isValid).toBe(false);
    });
  });

  describe('Audit Log', () => {
    it('should create audit log entries for users', async () => {
      const user = await createTestUser(prisma, { email: 'audit@test.com' });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_CREATED',
          entityType: 'User',
          entityId: user.id,
          newValue: { email: user.email, role: user.role },
        },
      });

      const logs = await prisma.auditLog.findMany({
        where: { userId: user.id },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('USER_CREATED');
      expect(logs[0].entityType).toBe('User');
    });
  });
});
