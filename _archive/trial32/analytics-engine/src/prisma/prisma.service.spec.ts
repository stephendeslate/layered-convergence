import { describe, it, expect, vi, beforeEach } from 'vitest';

const poolInstances: any[] = [];
const adapterInstances: any[] = [];

vi.mock('pg', () => {
  return {
    Pool: class MockPool {
      constructor(public opts: any) {
        poolInstances.push(this);
      }
    },
  };
});

vi.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: class MockPrismaPg {
      constructor(public pool: any) {
        adapterInstances.push(this);
      }
    },
  };
});

vi.mock('../../generated/prisma/client.js', () => {
  return {
    PrismaClient: class MockPrismaClient {
      constructor(public opts?: any) {}
      $connect = vi.fn().mockResolvedValue(undefined);
      $disconnect = vi.fn().mockResolvedValue(undefined);
    },
  };
});

import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    poolInstances.length = 0;
    adapterInstances.length = 0;
    service = new PrismaService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect on module init', async () => {
    service.$connect = vi.fn().mockResolvedValue(undefined);
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect on module destroy', async () => {
    service.$disconnect = vi.fn().mockResolvedValue(undefined);
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });

  it('should create a Pool instance', () => {
    expect(poolInstances.length).toBeGreaterThan(0);
  });

  it('should create a PrismaPg adapter instance', () => {
    expect(adapterInstances.length).toBeGreaterThan(0);
  });

  it('should pass Pool to PrismaPg adapter', () => {
    expect(adapterInstances[0].pool).toBe(poolInstances[0]);
  });
});
