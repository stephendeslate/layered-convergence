import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPoolEnd = vi.fn().mockResolvedValue(undefined);
const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockDisconnect = vi.fn().mockResolvedValue(undefined);

vi.mock('pg', () => {
  const PoolMock = vi.fn().mockImplementation(() => ({
    end: mockPoolEnd,
  }));
  return { Pool: PoolMock };
});

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(function (this: any) {
    this.$connect = mockConnect;
    this.$disconnect = mockDisconnect;
  }),
}));

import { PrismaService } from './prisma.service';
import { Pool } from 'pg';

describe('PrismaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    const service = new PrismaService();
    expect(service).toBeDefined();
  });

  it('should use Pool from pg', () => {
    new PrismaService();
    expect(Pool).toHaveBeenCalled();
  });

  it('should use PrismaPg adapter', async () => {
    const { PrismaPg } = await import('@prisma/adapter-pg');
    new PrismaService();
    expect(PrismaPg).toHaveBeenCalled();
  });

  it('should connect on module init', async () => {
    const service = new PrismaService();
    await service.onModuleInit();
    expect(mockConnect).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    const service = new PrismaService();
    await service.onModuleDestroy();
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockPoolEnd).toHaveBeenCalled();
  });

  it('should use DATABASE_URL env var when available', () => {
    const original = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://test:test@db:5432/test';
    new PrismaService();
    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionString: 'postgresql://test:test@db:5432/test',
      }),
    );
    process.env.DATABASE_URL = original;
  });
});
