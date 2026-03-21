import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Mock the $connect and $disconnect methods
    vi.spyOn(service, '$connect').mockResolvedValue(undefined);
    vi.spyOn(service, '$disconnect').mockResolvedValue(undefined);
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

  it('should set tenant context via withTenantContext', async () => {
    const mockTx = {
      $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(service, '$transaction').mockImplementation(async (fn: any) => {
      return fn(mockTx);
    });

    const result = await service.withTenantContext('company-123', async (tx) => {
      return 'test-result';
    });

    expect(result).toBe('test-result');
    expect(mockTx.$executeRawUnsafe).toHaveBeenCalledWith(
      "SET LOCAL app.current_company_id = 'company-123'",
    );
  });

  it('should reject cleanDatabase in non-test environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    await expect(service.cleanDatabase()).rejects.toThrow(
      'cleanDatabase can only be used in test environment',
    );

    process.env.NODE_ENV = originalEnv;
  });
});
