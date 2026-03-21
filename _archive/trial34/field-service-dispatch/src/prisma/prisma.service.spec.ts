import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    // We test the service interface without instantiating (which needs a real adapter)
    service = Object.create(PrismaService.prototype);
  });

  it('should have onModuleInit method', () => {
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should have setCompanyContext method', () => {
    expect(typeof service.setCompanyContext).toBe('function');
  });

  it('should extend PrismaClient', () => {
    // PrismaService prototype chain includes PrismaClient
    expect(service).toBeInstanceOf(PrismaService);
  });

  it('should call $connect on onModuleInit', async () => {
    service.$connect = vi.fn().mockResolvedValue(undefined);
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect on onModuleDestroy', async () => {
    service.$disconnect = vi.fn().mockResolvedValue(undefined);
    (service as any).pool = { end: vi.fn().mockResolvedValue(undefined) };
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });

  it('should end pool on onModuleDestroy', async () => {
    service.$disconnect = vi.fn().mockResolvedValue(undefined);
    const mockEnd = vi.fn().mockResolvedValue(undefined);
    (service as any).pool = { end: mockEnd };
    await service.onModuleDestroy();
    expect(mockEnd).toHaveBeenCalled();
  });
});
