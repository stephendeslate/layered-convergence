import { describe, it, expect, beforeEach, vi } from 'vitest';
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
      $queryRaw: vi.fn().mockResolvedValue([{ current_setting: 'tenant-1' }]),
    };

    const module = await Test.createTestingModule({
      providers: [
        TenantContextService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TenantContextService);
  });

  describe('setTenantContext', () => {
    it('should call $executeRaw with set_config', async () => {
      await service.setTenantContext('tenant-1');
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });

    it('should not throw on success', async () => {
      await expect(service.setTenantContext('tenant-1')).resolves.not.toThrow();
    });
  });

  describe('getTenantContext', () => {
    it('should return tenant id from current_setting', async () => {
      const result = await service.getTenantContext();
      expect(result).toBe('tenant-1');
    });

    it('should return null when no setting is set', async () => {
      prisma.$queryRaw.mockResolvedValue([{ current_setting: '' }]);
      const result = await service.getTenantContext();
      expect(result).toBeNull();
    });

    it('should return null when result is empty', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      const result = await service.getTenantContext();
      expect(result).toBeNull();
    });
  });
});
