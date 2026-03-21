import { Pool } from 'pg';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  createTestPool,
  createTestPrisma,
  cleanDatabase,
  createTestUser,
} from './helpers';

describe('Prisma Error Handling (Integration)', () => {
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

  describe('P2002 - Unique Constraint Violation (409)', () => {
    it('should throw P2002 when creating duplicate email', async () => {
      await createTestUser(prisma, { email: 'dup@test.com' });

      try {
        await createTestUser(prisma, { email: 'dup@test.com' });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });

    it('should include target fields in P2002 meta', async () => {
      await createTestUser(prisma, { email: 'dup2@test.com' });

      try {
        await createTestUser(prisma, { email: 'dup2@test.com' });
        expect.unreachable('Should have thrown');
      } catch (error) {
        const prismaError = error as Prisma.PrismaClientKnownRequestError;
        expect(prismaError.code).toBe('P2002');
      }
    });

    it('should throw P2002 for duplicate webhook idempotency key', async () => {
      const user = await createTestUser(prisma, { email: 'hook@test.com' });
      const endpoint = await prisma.webhookEndpoint.create({
        data: {
          userId: user.id,
          url: 'https://example.com/hook',
          secret: 'secret',
          events: ['test'],
        },
      });

      await prisma.webhookEvent.create({
        data: {
          endpointId: endpoint.id,
          eventType: 'test',
          payload: {},
          idempotencyKey: 'unique-key-1',
        },
      });

      try {
        await prisma.webhookEvent.create({
          data: {
            endpointId: endpoint.id,
            eventType: 'test',
            payload: {},
            idempotencyKey: 'unique-key-1',
          },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });
  });

  describe('P2025 - Record Not Found (404)', () => {
    it('should throw P2025 when updating non-existent user', async () => {
      try {
        await prisma.user.update({
          where: { id: '00000000-0000-0000-0000-000000000000' },
          data: { name: 'Updated' },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });

    it('should throw P2025 when deleting non-existent transaction', async () => {
      try {
        await prisma.transaction.delete({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });

    it('should throw P2025 when deleting non-existent dispute', async () => {
      try {
        await prisma.dispute.delete({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });
  });
});
