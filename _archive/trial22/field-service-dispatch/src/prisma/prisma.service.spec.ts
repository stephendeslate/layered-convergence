import { describe, it, expect, vi, beforeEach } from 'vitest';

const { PoolSpy, PrismaPgSpy } = vi.hoisted(() => {
  const PoolSpy = vi.fn(function () {});
  const PrismaPgSpy = vi.fn(function () {
    return { provider: 'postgres', adapterName: '@prisma/adapter-pg' };
  });
  return { PoolSpy, PrismaPgSpy };
});

vi.mock('pg', () => ({ Pool: PoolSpy }));
vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: PrismaPgSpy }));

vi.mock('../../generated/prisma/client.js', () => {
  class MockPrismaClient {
    constructor(_opts?: Record<string, unknown>) {}
    $connect = vi.fn();
    $disconnect = vi.fn();
  }
  return { PrismaClient: MockPrismaClient };
});

import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    const service = new PrismaService();
    expect(service).toBeDefined();
  });

  it('should have $connect method', () => {
    const service = new PrismaService();
    expect(service.$connect).toBeDefined();
  });

  it('should have $disconnect method', () => {
    const service = new PrismaService();
    expect(service.$disconnect).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    const service = new PrismaService();
    expect(service.onModuleInit).toBeDefined();
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    const service = new PrismaService();
    expect(service.onModuleDestroy).toBeDefined();
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should use Pool from pg in constructor', () => {
    new PrismaService();
    expect(PoolSpy).toHaveBeenCalledWith(
      expect.objectContaining({ connectionString: expect.any(String) }),
    );
  });

  it('should use PrismaPg adapter in constructor', () => {
    new PrismaService();
    expect(PrismaPgSpy).toHaveBeenCalled();
  });
});
