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
      $executeRaw: vi.fn().mockResolvedValue(1),
      $queryRaw: vi.fn().mockResolvedValue([{ current_setting: 'tenant-123' }]),
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

  it('should set tenant context', async () => {
    await service.setTenantContext('tenant-123');
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('should get tenant context', async () => {
    const result = await service.getTenantContext();
    expect(result).toBe('tenant-123');
  });

  it('should return null when no tenant context is set', async () => {
    prisma.$queryRaw.mockResolvedValue([{ current_setting: '' }]);
    const result = await service.getTenantContext();
    expect(result).toBeNull();
  });

  it('should return null when query returns empty array', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    const result = await service.getTenantContext();
    expect(result).toBeNull();
  });
});
