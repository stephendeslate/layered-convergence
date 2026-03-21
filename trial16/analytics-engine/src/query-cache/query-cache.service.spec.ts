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
    queryHash: 'hash-abc123',
    result: { data: [1, 2, 3] },
    expiresAt: new Date(Date.now() + 60000),
    createdAt: new Date(),
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
    it('should return cached result if not expired', async () => {
      prisma.queryCache.findUnique.mockResolvedValue(mockCacheEntry);

      const result = await service.get(tenantId, 'hash-abc123');

      expect(result).not.toBeNull();
      expect(result?.queryHash).toBe('hash-abc123');
    });

    it('should return null and delete expired entry', async () => {
      const expiredEntry = {
        ...mockCacheEntry,
        expiresAt: new Date(Date.now() - 60000),
      };
      prisma.queryCache.findUnique.mockResolvedValue(expiredEntry);
      prisma.queryCache.delete.mockResolvedValue({});

      const result = await service.get(tenantId, 'hash-abc123');

      expect(result).toBeNull();
      expect(prisma.queryCache.delete).toHaveBeenCalledWith({
        where: { id: 'qc-1' },
      });
    });

    it('should return null if no entry exists', async () => {
      prisma.queryCache.findUnique.mockResolvedValue(null);

      const result = await service.get(tenantId, 'hash-nonexistent');

      expect(result).toBeNull();
    });

    it('should use compound key for lookup', async () => {
      prisma.queryCache.findUnique.mockResolvedValue(null);

      await service.get(tenantId, 'hash-abc');

      expect(prisma.queryCache.findUnique).toHaveBeenCalledWith({
        where: {
          tenantId_queryHash: { tenantId, queryHash: 'hash-abc' },
        },
      });
    });

    it('should not delete non-expired entry', async () => {
      prisma.queryCache.findUnique.mockResolvedValue(mockCacheEntry);

      await service.get(tenantId, 'hash-abc123');

      expect(prisma.queryCache.delete).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should upsert a cache entry with default TTL of 300s', async () => {
      prisma.queryCache.upsert.mockResolvedValue(mockCacheEntry);

      await service.set(tenantId, {
        queryHash: 'hash-abc123',
        result: { data: [1] },
      });

      expect(prisma.queryCache.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId_queryHash: { tenantId, queryHash: 'hash-abc123' },
          },
        }),
      );
    });

    it('should use provided TTL', async () => {
      prisma.queryCache.upsert.mockResolvedValue(mockCacheEntry);

      const beforeCall = Date.now();
      await service.set(tenantId, {
        queryHash: 'hash-abc',
        result: { data: [] },
        ttl: 600,
      });

      const callArgs = prisma.queryCache.upsert.mock.calls[0][0];
      const expiresAt = callArgs.create.expiresAt as Date;
      const expectedMin = beforeCall + 600 * 1000;
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin - 1000);
    });

    it('should include result in create and update', async () => {
      prisma.queryCache.upsert.mockResolvedValue(mockCacheEntry);

      await service.set(tenantId, {
        queryHash: 'hash-abc',
        result: { metrics: [10, 20] },
      });

      const callArgs = prisma.queryCache.upsert.mock.calls[0][0];
      expect(callArgs.create.result).toEqual({ metrics: [10, 20] });
      expect(callArgs.update.result).toEqual({ metrics: [10, 20] });
    });

    it('should include tenantId in created cache entry', async () => {
      prisma.queryCache.upsert.mockResolvedValue(mockCacheEntry);

      await service.set(tenantId, {
        queryHash: 'hash-abc',
        result: {},
      });

      const callArgs = prisma.queryCache.upsert.mock.calls[0][0];
      expect(callArgs.create.tenantId).toBe(tenantId);
    });
  });

  describe('invalidate', () => {
    it('should delete a specific cache entry', async () => {
      prisma.queryCache.delete.mockResolvedValue({});

      await service.invalidate(tenantId, 'hash-abc');

      expect(prisma.queryCache.delete).toHaveBeenCalledWith({
        where: {
          tenantId_queryHash: { tenantId, queryHash: 'hash-abc' },
        },
      });
    });

    it('should not throw if entry does not exist', async () => {
      prisma.queryCache.delete.mockRejectedValue(
        new Error('Record not found'),
      );

      await expect(
        service.invalidate(tenantId, 'hash-nonexistent'),
      ).resolves.not.toThrow();
    });
  });

  describe('invalidateAll', () => {
    it('should delete all cache entries for tenant', async () => {
      prisma.queryCache.deleteMany.mockResolvedValue({ count: 5 });

      await service.invalidateAll(tenantId);

      expect(prisma.queryCache.deleteMany).toHaveBeenCalledWith({
        where: { tenantId },
      });
    });

    it('should handle empty cache gracefully', async () => {
      prisma.queryCache.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.invalidateAll(tenantId)).resolves.not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should delete all expired entries across tenants', async () => {
      prisma.queryCache.deleteMany.mockResolvedValue({ count: 10 });

      await service.cleanup();

      expect(prisma.queryCache.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
        },
      });
    });

    it('should handle no expired entries', async () => {
      prisma.queryCache.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.cleanup()).resolves.not.toThrow();
    });
  });
});
