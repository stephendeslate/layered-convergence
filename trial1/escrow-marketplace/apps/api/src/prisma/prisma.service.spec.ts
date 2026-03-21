import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined);
    $disconnect = vi.fn().mockResolvedValue(undefined);
    $queryRaw = vi.fn().mockResolvedValue([{ result: 1 }]);
    $executeRawUnsafe = vi.fn().mockResolvedValue(undefined);
    $transaction = vi.fn().mockImplementation(async (fn: Function) => {
      return fn({
        $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
      });
    });
  }
  return { PrismaClient: MockPrismaClient };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });

  it('should execute withRls within a transaction', async () => {
    const callback = vi.fn().mockResolvedValue('result');
    const result = await service.withRls('user-123', 'BUYER', callback);
    expect(service.$transaction).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
    expect(result).toBe('result');
  });
});
