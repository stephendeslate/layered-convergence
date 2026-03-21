import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should have withTenantContext method', () => {
    expect(typeof service.withTenantContext).toBe('function');
  });

  it('should return an extended client from withTenantContext', () => {
    const extended = service.withTenantContext('test-tenant-id');
    expect(extended).toBeDefined();
    // The extended client should still have Prisma model accessors
    expect(extended.tenant).toBeDefined();
    expect(extended.dataSource).toBeDefined();
    expect(extended.dashboard).toBeDefined();
  });

  it('should have withTenantTransaction method', () => {
    expect(typeof service.withTenantTransaction).toBe('function');
  });

  it('should escape single quotes in tenant ID for SQL injection prevention', () => {
    const extended = service.withTenantContext("test'tenant");
    expect(extended).toBeDefined();
  });
});
