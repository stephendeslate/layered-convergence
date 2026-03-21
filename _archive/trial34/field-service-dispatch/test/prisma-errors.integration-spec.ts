import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestCustomer,
} from './helpers';

describe('Prisma Errors (Integration)', () => {
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
    const company = await createTestCompany(prisma, { name: 'Error Test Co', slug: 'error-test' });
    companyId = company.id;
  });

  it('should throw P2002 on duplicate company slug', async () => {
    try {
      await prisma.company.create({ data: { name: 'Dup', slug: 'error-test' } });
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
    }
  });

  it('should throw P2025 on update of nonexistent record', async () => {
    try {
      await prisma.company.update({
        where: { id: '00000000-0000-0000-0000-000000000000' },
        data: { name: 'Updated' },
      });
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
    }
  });

  it('should throw P2003 on invalid foreign key', async () => {
    try {
      await prisma.customer.create({
        data: {
          name: 'Orphan',
          address: '123 Nowhere',
          companyId: '00000000-0000-0000-0000-000000000000',
        },
      });
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2003');
    }
  });

  it('should throw P2025 on delete of nonexistent record', async () => {
    try {
      await prisma.company.delete({
        where: { id: '00000000-0000-0000-0000-000000000000' },
      });
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
    }
  });

  it('should handle unique constraint on user email', async () => {
    await prisma.user.create({
      data: {
        email: 'unique@test.com',
        password: 'hash',
        name: 'User A',
        companyId,
      },
    });

    try {
      await prisma.user.create({
        data: {
          email: 'unique@test.com',
          password: 'hash',
          name: 'User B',
          companyId,
        },
      });
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
    }
  });
});
