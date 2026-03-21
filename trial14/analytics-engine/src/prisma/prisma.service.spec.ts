import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pg', () => {
  const Pool = vi.fn().mockImplementation(() => ({}));
  return { Pool };
});

vi.mock('@prisma/adapter-pg', () => {
  const PrismaPg = vi.fn().mockImplementation(() => ({}));
  return { PrismaPg };
});

vi.mock('@prisma/client', () => {
  class PrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined);
    $disconnect = vi.fn().mockResolvedValue(undefined);
    constructor(_opts?: any) {}
  }
  return { PrismaClient };
});

import { PrismaService } from './prisma.service';

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
});
