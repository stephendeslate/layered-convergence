import { describe, it, expect, beforeEach } from 'vitest';
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
      $executeRaw: vi.fn(),
      $queryRaw: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        TenantContextService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TenantContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $executeRaw to set tenant context', async () => {
    prisma.$executeRaw.mockResolvedValue(undefined);
    await service.setTenantContext('tenant-1');
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('should call $queryRaw to get tenant context', async () => {
    prisma.$queryRaw.mockResolvedValue([{ current_setting: 'tenant-1' }]);
    const result = await service.getTenantContext();
    expect(result).toBe('tenant-1');
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
