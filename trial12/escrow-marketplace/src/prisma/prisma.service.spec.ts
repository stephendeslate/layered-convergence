import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service.js';

vi.mock('pg', () => {
  class MockPool {
    end = vi.fn().mockResolvedValue(undefined);
  }
  return { default: { Pool: MockPool } };
});

vi.mock('@prisma/adapter-pg', () => {
  class MockPrismaPg {
    constructor(_pool: unknown) {}
  }
  return { PrismaPg: MockPrismaPg };
});

vi.mock('../../generated/prisma/client.js', () => {
  class MockPrismaClient {
    constructor(_opts?: unknown) {}
    $connect = vi.fn().mockResolvedValue(undefined);
    $disconnect = vi.fn().mockResolvedValue(undefined);
  }
  return { PrismaClient: MockPrismaClient };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
    service = new PrismaService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect on module init', async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect and pool.end on module destroy', async () => {
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });
});
