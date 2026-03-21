import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryCacheService } from './query-cache.service';

// Mock ioredis
vi.mock('ioredis', () => {
  const MockRedis = vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    quit: vi.fn(),
  }));
  return { default: MockRedis };
});

describe('QueryCacheService', () => {
  let service: QueryCacheService;
  let mockRedis: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new QueryCacheService();
    mockRedis = service.getRedisClient();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return parsed data from cache', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ value: 42 }));

      const result = await service.get('tenant-1', 'metrics', 'cpu');

      expect(result).toEqual({ value: 42 });
      expect(mockRedis.get).toHaveBeenCalledWith('analytics:tenant-1:metrics:cpu');
    });

    it('should return null for cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get('tenant-1', 'metrics', 'cpu');

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', async () => {
      mockRedis.get.mockResolvedValue('not-json{');

      const result = await service.get('tenant-1', 'metrics', 'cpu');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set data with default TTL', async () => {
      await service.set('tenant-1', 'metrics', 'cpu', { value: 42 });

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'analytics:tenant-1:metrics:cpu',
        300,
        JSON.stringify({ value: 42 }),
      );
    });

    it('should set data with custom TTL', async () => {
      await service.set('tenant-1', 'metrics', 'cpu', { value: 42 }, 600);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'analytics:tenant-1:metrics:cpu',
        600,
        JSON.stringify({ value: 42 }),
      );
    });
  });

  describe('invalidate', () => {
    it('should delete a specific cache key', async () => {
      await service.invalidate('tenant-1', 'metrics', 'cpu');

      expect(mockRedis.del).toHaveBeenCalledWith('analytics:tenant-1:metrics:cpu');
    });
  });

  describe('invalidateNamespace', () => {
    it('should delete all keys in a namespace', async () => {
      mockRedis.keys.mockResolvedValue([
        'analytics:tenant-1:metrics:cpu',
        'analytics:tenant-1:metrics:memory',
      ]);

      await service.invalidateNamespace('tenant-1', 'metrics');

      expect(mockRedis.keys).toHaveBeenCalledWith('analytics:tenant-1:metrics:*');
      expect(mockRedis.del).toHaveBeenCalledWith(
        'analytics:tenant-1:metrics:cpu',
        'analytics:tenant-1:metrics:memory',
      );
    });

    it('should not call del when no keys match', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await service.invalidateNamespace('tenant-1', 'metrics');

      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('invalidateTenant', () => {
    it('should delete all keys for a tenant', async () => {
      mockRedis.keys.mockResolvedValue(['analytics:tenant-1:metrics:cpu']);

      await service.invalidateTenant('tenant-1');

      expect(mockRedis.keys).toHaveBeenCalledWith('analytics:tenant-1:*');
      expect(mockRedis.del).toHaveBeenCalledWith('analytics:tenant-1:metrics:cpu');
    });
  });

  describe('getOrSet', () => {
    it('should return cached value when available', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ value: 42 }));
      const factory = vi.fn();

      const result = await service.getOrSet('tenant-1', 'metrics', 'cpu', factory);

      expect(result).toEqual({ value: 42 });
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory and cache result on miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      const factory = vi.fn().mockResolvedValue({ value: 99 });

      const result = await service.getOrSet('tenant-1', 'metrics', 'cpu', factory);

      expect(result).toEqual({ value: 99 });
      expect(factory).toHaveBeenCalledOnce();
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should pass custom TTL to set', async () => {
      mockRedis.get.mockResolvedValue(null);
      const factory = vi.fn().mockResolvedValue('data');

      await service.getOrSet('tenant-1', 'ns', 'key', factory, 120);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'analytics:tenant-1:ns:key',
        120,
        JSON.stringify('data'),
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit redis connection', async () => {
      await service.onModuleDestroy();

      expect(mockRedis.quit).toHaveBeenCalledOnce();
    });
  });
});
