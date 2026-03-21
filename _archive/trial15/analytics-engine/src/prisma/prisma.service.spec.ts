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
    constructor(_opts?: any) {}
    $connect = vi.fn();
    $disconnect = vi.fn();
  }
  return { PrismaClient };
});

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('should create pool with connection string from env', () => {
    expect(Pool).toHaveBeenCalledWith({
      connectionString: expect.any(String),
    });
  });

  it('should create PrismaPg adapter with pool', () => {
    expect(PrismaPg).toHaveBeenCalled();
  });
});
