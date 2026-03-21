import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryCacheService } from './query-cache.service.js';

const mockPrisma = {
  queryCache: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
};

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new QueryCacheService(mockPrisma as any);
  });

  describe('generateHash', () => {
    it('should generate a SHA-256 hash', () => {
      const hash = service.generateHash({ foo: 'bar' });
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce same hash for same input', () => {
      const hash1 = service.generateHash({ a: 1 });
      const hash2 = service.generateHash({ a: 1 });
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', () => {
      const hash1 = service.generateHash({ a: 1 });
      const hash2 = service.generateHash({ a: 2 });
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('get', () => {
    it('should return null if not cached', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);
      const result = await service.get('hash123');
      expect(result).toBeNull();
    });

    it('should return cached result if not expired', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: 'qc-1',
        result: { data: [1, 2, 3] },
        expiresAt: new Date(Date.now() + 60000),
      });
      const result = await service.get('hash123');
      expect(result).toEqual({ data: [1, 2, 3] });
    });

    it('should delete and return null if expired', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: 'qc-1',
        result: { data: 'old' },
        expiresAt: new Date(Date.now() - 1000),
      });
      mockPrisma.queryCache.delete.mockResolvedValue({});
      const result = await service.get('hash123');
      expect(result).toBeNull();
      expect(mockPrisma.queryCache.delete).toHaveBeenCalledWith({
        where: { id: 'qc-1' },
      });
    });
  });

  describe('set', () => {
    it('should create new cache entry', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);
      mockPrisma.queryCache.create.mockResolvedValue({
        id: 'qc-1',
        queryHash: 'hash',
      });
      const result = await service.set('hash', { data: [1] }, 300);
      expect(mockPrisma.queryCache.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should update existing cache entry', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: 'qc-1',
        queryHash: 'hash',
      });
      mockPrisma.queryCache.update.mockResolvedValue({
        id: 'qc-1',
        result: { data: [2] },
      });
      const result = await service.set('hash', { data: [2] });
      expect(mockPrisma.queryCache.update).toHaveBeenCalledWith({
        where: { id: 'qc-1' },
        data: expect.objectContaining({ result: { data: [2] } }),
      });
      expect(result).toBeDefined();
    });

    it('should use default TTL of 300 seconds', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);
      mockPrisma.queryCache.create.mockResolvedValue({});
      await service.set('hash', { data: [] });
      const call = mockPrisma.queryCache.create.mock.calls[0][0];
      const expiresAt = call.data.expiresAt;
      const diff = expiresAt.getTime() - Date.now();
      expect(diff).toBeGreaterThan(298000);
      expect(diff).toBeLessThan(302000);
    });
  });

  describe('invalidate', () => {
    it('should delete cache entry if exists', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({ id: 'qc-1' });
      mockPrisma.queryCache.delete.mockResolvedValue({});
      await service.invalidate('hash');
      expect(mockPrisma.queryCache.delete).toHaveBeenCalledWith({
        where: { id: 'qc-1' },
      });
    });

    it('should do nothing if entry does not exist', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);
      await service.invalidate('hash');
      expect(mockPrisma.queryCache.delete).not.toHaveBeenCalled();
    });
  });

  describe('invalidateAll', () => {
    it('should delete all cache entries', async () => {
      mockPrisma.queryCache.deleteMany.mockResolvedValue({ count: 5 });
      await service.invalidateAll();
      expect(mockPrisma.queryCache.deleteMany).toHaveBeenCalled();
    });
  });
});
