import { QueryCacheService } from './query-cache.service.js';

describe('QueryCacheService', () => {
  let service: QueryCacheService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      queryCache: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
    service = new QueryCacheService(mockPrisma);
  });

  describe('generateHash', () => {
    it('should generate consistent hashes', () => {
      const hash1 = service.generateHash({ key: 'value' });
      const hash2 = service.generateHash({ key: 'value' });
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different input', () => {
      const hash1 = service.generateHash({ key: 'value1' });
      const hash2 = service.generateHash({ key: 'value2' });
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('get', () => {
    it('should return null if not cached', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);
      const result = await service.get('hash1');
      expect(result).toBeNull();
    });

    it('should return cached result if not expired', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: '1',
        queryHash: 'hash1',
        result: { data: 42 },
        expiresAt: new Date(Date.now() + 60000),
      });
      const result = await service.get('hash1');
      expect(result).toEqual({ data: 42 });
    });

    it('should delete and return null if expired', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: '1',
        queryHash: 'hash1',
        result: { data: 42 },
        expiresAt: new Date(Date.now() - 60000),
      });
      mockPrisma.queryCache.delete.mockResolvedValue({});
      const result = await service.get('hash1');
      expect(result).toBeNull();
      expect(mockPrisma.queryCache.delete).toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should create a new cache entry', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);
      mockPrisma.queryCache.create.mockResolvedValue({ id: '1' });
      await service.set('hash1', { data: 42 }, 300);
      expect(mockPrisma.queryCache.create).toHaveBeenCalled();
    });

    it('should update an existing cache entry', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({
        id: '1',
        queryHash: 'hash1',
      });
      mockPrisma.queryCache.update.mockResolvedValue({ id: '1' });
      await service.set('hash1', { data: 99 }, 300);
      expect(mockPrisma.queryCache.update).toHaveBeenCalled();
    });
  });

  describe('invalidate', () => {
    it('should delete a cache entry', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.queryCache.delete.mockResolvedValue({});
      await service.invalidate('hash1');
      expect(mockPrisma.queryCache.delete).toHaveBeenCalled();
    });

    it('should do nothing if not found', async () => {
      mockPrisma.queryCache.findFirst.mockResolvedValue(null);
      await service.invalidate('hash1');
      expect(mockPrisma.queryCache.delete).not.toHaveBeenCalled();
    });
  });

  describe('invalidateAll', () => {
    it('should delete all cache entries', async () => {
      mockPrisma.queryCache.deleteMany.mockResolvedValue({});
      await service.invalidateAll();
      expect(mockPrisma.queryCache.deleteMany).toHaveBeenCalled();
    });
  });
});
