import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestCustomer,
} from './helpers';

describe('Prisma Errors (integration)', () => {
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
    const company = await createTestCompany(prisma, { slug: `err-test-${Date.now()}` });
    companyId = company.id;
  });

  it('should throw P2002 on duplicate unique field (company slug)', async () => {
    const slug = `dup-slug-${Date.now()}`;
    await createTestCompany(prisma, { slug });

    try {
      await createTestCompany(prisma, { slug });
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
    }
  });

  it('should throw P2002 on duplicate user email', async () => {
    const email = `dup-${Date.now()}@test.com`;
    await prisma.user.create({
      data: { email, name: 'User 1', password: 'hash', companyId },
    });

    try {
      await prisma.user.create({
        data: { email, name: 'User 2', password: 'hash', companyId },
      });
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
    }
  });

  it('should throw P2003 on foreign key violation (invalid companyId)', async () => {
    try {
      await prisma.customer.create({
        data: {
          name: 'Bad Customer',
          address: '123 Nowhere',
          companyId: '00000000-0000-0000-0000-000000000000',
        },
      });
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2003');
    }
  });

  it('should throw P2025 on update of non-existent record', async () => {
    try {
      await prisma.company.update({
        where: { id: '00000000-0000-0000-0000-000000000000' },
        data: { name: 'Ghost' },
      });
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
    }
  });

  it('should throw P2025 on delete of non-existent record', async () => {
    try {
      await prisma.company.delete({
        where: { id: '00000000-0000-0000-0000-000000000000' },
      });
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((e as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
    }
  });

  it('should handle concurrent unique constraint violations', async () => {
    const slug = `concurrent-${Date.now()}`;
    const results = await Promise.allSettled([
      createTestCompany(prisma, { slug }),
      createTestCompany(prisma, { slug }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    const error = (rejected[0] as PromiseRejectedResult).reason;
    expect(error.code).toBe('P2002');
  });
});
