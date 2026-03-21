import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TenantContextService } from './tenant-context.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TenantContextService', () => {
  let service: TenantContextService;
  let prisma: {
    $executeRaw: ReturnType<typeof vi.fn>;
    $queryRaw: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prisma = {
      $executeRaw: vi.fn().mockResolvedValue(undefined),
      $queryRaw: vi.fn().mockResolvedValue([{ current_setting: 'tenant-1' }]),
    };

    const module = await Test.createTestingModule({
      providers: [
        TenantContextService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $executeRaw when setting tenant context', async () => {
    await service.setTenantContext('tenant-1');
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('should call $queryRaw when getting tenant context', async () => {
    await service.getTenantContext();
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('should return tenant id from context', async () => {
    const result = await service.getTenantContext();
    expect(result).toBe('tenant-1');
  });

  it('should return null when no tenant context set', async () => {
    prisma.$queryRaw.mockResolvedValue([{ current_setting: '' }]);
    const result = await service.getTenantContext();
    expect(result).toBeNull();
  });

  it('should return null when query returns empty array', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    const result = await service.getTenantContext();
    expect(result).toBeNull();
  });

  it('should accept any string as tenantId', async () => {
    await service.setTenantContext('abc-123');
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
