import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryCacheService } from './query-cache.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QueryCacheService', () => {
  let service: QueryCacheService;
  let prisma: {
    queryCache: {
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';

  const mockCacheEntry = {
    id: 'qc-1',
    tenantId,
    queryHash: 'hash-abc',
    result: { data: [1, 2, 3] },
    expiresAt: new Date(Date.now() + 60000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      queryCache: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryCacheService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QueryCacheService>(QueryCacheService);
  });

  describe('get', () => {
    it('should return cached entry if not expired', async () => {
      prisma.queryCache.findUnique.mockResolvedValue(mockCacheEntry);

      const result = await service.get(tenantId, 'hash-abc');

      expect(result).toEqual(mockCacheEntry);
      expect(prisma.queryCache.findUnique).toHaveBeenCalledWith({
        where: { tenantId_queryHash: { tenantId, queryHash: 'hash-abc' } },
      });
    });

    it('should return null if no cache entry found', async () => {
      prisma.queryCache.findUnique.mockResolvedValue(null);

      const result = await service.get(tenantId, 'hash-missing');

      expect(result).toBeNull();
    });

    it('should return null and delete entry if expired', async () => {
      const expiredEntry = {
        ...mockCacheEntry,
        expiresAt: new Date('2020-01-01'),
      };
      prisma.queryCache.findUnique.mockResolvedValue(expiredEntry);
      prisma.queryCache.delete.mockResolvedValue(expiredEntry);

      const result = await service.get(tenantId, 'hash-abc');

      expect(result).toBeNull();
      expect(prisma.queryCache.delete).toHaveBeenCalledWith({
        where: { id: 'qc-1' },
      });
    });
  });

  describe('set', () => {
    it('should upsert a cache entry with default TTL', async () => {
      prisma.queryCache.upsert.mockResolvedValue(mockCacheEntry);

      const result = await service.set(tenantId, {
        queryHash: 'hash-abc',
        result: { data: [1, 2, 3] },
      });

      expect(result).toEqual(mockCacheEntry);
      expect(prisma.queryCache.upsert).toHaveBeenCalledWith({
        where: { tenantId_queryHash: { tenantId, queryHash: 'hash-abc' } },
        create: expect.objectContaining({
          tenantId,
          queryHash: 'hash-abc',
          result: { data: [1, 2, 3] },
        }),
        update: expect.objectContaining({
          result: { data: [1, 2, 3] },
        }),
      });
    });

    it('should use custom TTL when provided', async () => {
      prisma.queryCache.upsert.mockResolvedValue(mockCacheEntry);

      const before = Date.now();
      await service.set(tenantId, {
        queryHash: 'hash-abc',
        result: { data: [] },
        ttl: 600,
      });

      const call = prisma.queryCache.upsert.mock.calls[0][0];
      const expiresAt = call.create.expiresAt.getTime();
      expect(expiresAt).toBeGreaterThanOrEqual(before + 600 * 1000 - 100);
      expect(expiresAt).toBeLessThanOrEqual(before + 600 * 1000 + 1000);
    });
  });

  describe('invalidate', () => {
    it('should delete a specific cache entry', async () => {
      prisma.queryCache.delete.mockResolvedValue(mockCacheEntry);

      await service.invalidate(tenantId, 'hash-abc');

      expect(prisma.queryCache.delete).toHaveBeenCalledWith({
        where: { tenantId_queryHash: { tenantId, queryHash: 'hash-abc' } },
      });
    });

    it('should not throw if entry does not exist', async () => {
      prisma.queryCache.delete.mockRejectedValue(new Error('Record not found'));

      await expect(
        service.invalidate(tenantId, 'hash-missing'),
      ).resolves.not.toThrow();
    });
  });

  describe('invalidateAll', () => {
    it('should delete all cache entries for a tenant', async () => {
      prisma.queryCache.deleteMany.mockResolvedValue({ count: 5 });

      await service.invalidateAll(tenantId);

      expect(prisma.queryCache.deleteMany).toHaveBeenCalledWith({
        where: { tenantId },
      });
    });
  });

  describe('cleanup', () => {
    it('should delete all expired cache entries', async () => {
      prisma.queryCache.deleteMany.mockResolvedValue({ count: 3 });

      await service.cleanup();

      expect(prisma.queryCache.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
        },
      });
    });
  });
});
