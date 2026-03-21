import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryCacheService } from './query-cache.service';

describe('QueryCacheService', () => {
  let service: QueryCacheService;
  let mockRedis: {
    get: ReturnType<typeof vi.fn>;
    setex: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    keys: ReturnType<typeof vi.fn>;
    quit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockRedis = {
      get: vi.fn().mockResolvedValue(null),
      setex: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
      quit: vi.fn().mockResolvedValue('OK'),
    };

    service = new QueryCacheService();
    (service as any).redis = mockRedis;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null for cache miss', async () => {
    const result = await service.get('tenant-1', 'hash-1');
    expect(result).toBeNull();
    expect(mockRedis.get).toHaveBeenCalledWith('query_cache:tenant-1:hash-1');
  });

  it('should return parsed data for cache hit', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify({ count: 42 }));
    const result = await service.get('tenant-1', 'hash-1');
    expect(result).toEqual({ count: 42 });
  });

  it('should set cache with default TTL', async () => {
    await service.set('tenant-1', 'hash-1', { count: 42 });
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      300,
      JSON.stringify({ count: 42 }),
    );
  });

  it('should set cache with custom TTL', async () => {
    await service.set('tenant-1', 'hash-1', { count: 42 }, 600);
    expect(mockRedis.setex).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      600,
      JSON.stringify({ count: 42 }),
    );
  });

  it('should invalidate a single cache entry', async () => {
    await service.invalidate('tenant-1', 'hash-1');
    expect(mockRedis.del).toHaveBeenCalledWith('query_cache:tenant-1:hash-1');
  });

  it('should invalidate all cache entries for a tenant', async () => {
    mockRedis.keys.mockResolvedValue([
      'query_cache:tenant-1:hash-1',
      'query_cache:tenant-1:hash-2',
    ]);
    await service.invalidateAll('tenant-1');
    expect(mockRedis.keys).toHaveBeenCalledWith('query_cache:tenant-1:*');
    expect(mockRedis.del).toHaveBeenCalledWith(
      'query_cache:tenant-1:hash-1',
      'query_cache:tenant-1:hash-2',
    );
  });

  it('should not call del when no keys found for invalidateAll', async () => {
    mockRedis.keys.mockResolvedValue([]);
    await service.invalidateAll('tenant-1');
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it('should build correct key pattern', async () => {
    await service.get('tenant-abc', 'query-xyz');
    expect(mockRedis.get).toHaveBeenCalledWith('query_cache:tenant-abc:query-xyz');
  });
});
